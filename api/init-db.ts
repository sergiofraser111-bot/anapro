import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = process.env.DATABASE_URL;
  if (!url) return res.status(500).json({ error: 'DATABASE_URL missing' });

  const sql = neon(url);

  try {
    console.log('[Init] Starting database schema migration (Deep Clean Mode)...');

    await sql`
-- Cleanup old mess
DROP VIEW IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL CHECK (length(wallet_address) BETWEEN 32 AND 44),
  username TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_]+$'),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (phone IS NULL OR length(phone) BETWEEN 10 AND 20),
  date_of_birth DATE CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
  country TEXT CHECK (country IS NULL OR length(country) BETWEEN 2 AND 100),
  country_code TEXT CHECK (country_code IS NULL OR length(country_code) = 2),
  profile_complete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0 CHECK (login_count >= 0)
);

-- ============================================================================
-- PLATFORM BALANCES TABLE
-- ============================================================================
CREATE TABLE platform_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  
  -- Available balances
  sol_balance DECIMAL(20, 8) DEFAULT 0 CHECK (sol_balance >= 0),
  usdc_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_balance >= 0),
  usdt_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_balance >= 0),
  
  -- Locked balances
  sol_locked DECIMAL(20, 8) DEFAULT 0 CHECK (sol_locked >= 0),
  usdc_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_locked >= 0),
  usdt_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_locked >= 0),
  
  -- Lifetime statistics
  total_profit_earned DECIMAL(20, 8) DEFAULT 0 CHECK (total_profit_earned >= 0),
  total_deposited DECIMAL(20, 8) DEFAULT 0 CHECK (total_deposited >= 0),
  total_withdrawn DECIMAL(20, 8) DEFAULT 0 CHECK (total_withdrawn >= 0),
  
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  tx_hash TEXT,
  tx_verified BOOLEAN DEFAULT false,
  tx_verified_at TIMESTAMPTZ,
  
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INVESTMENTS TABLE
-- ============================================================================
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  
  daily_return DECIMAL(5, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  expected_return DECIMAL(20, 8) NOT NULL,
  
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ,
  maturity_date TIMESTAMPTZ NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'active',
  
  profit_earned DECIMAL(20, 8) DEFAULT 0,
  last_profit_date TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  
  session_token TEXT UNIQUE NOT NULL,
  signature TEXT NOT NULL,
  message TEXT NOT NULL,
  
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  ip_address INET,
  user_agent TEXT,
  
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT,
  
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
        `;

    // Verify tables exist
    const result = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;

    console.log('[Init] Migration complete! Tables:', result);

    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      tables: result
    });

  } catch (error: any) {
    console.error('[Init] Migration failed:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
