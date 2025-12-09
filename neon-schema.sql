-- Neon PostgreSQL Schema with Security Enhancements
-- Production-ready schema with proper constraints and security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL CHECK (length(wallet_address) BETWEEN 32 AND 44),
  username TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_]+$'),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (phone IS NULL OR length(phone) BETWEEN 10 AND 20),
  date_of_birth DATE CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
  country TEXT NOT NULL CHECK (length(country) BETWEEN 2 AND 100),
  country_code TEXT NOT NULL CHECK (length(country_code) = 2),
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
CREATE TABLE IF NOT EXISTS platform_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  
  -- Available balances (must be non-negative)
  sol_balance DECIMAL(20, 8) DEFAULT 0 CHECK (sol_balance >= 0),
  usdc_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_balance >= 0),
  usdt_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_balance >= 0),
  
  -- Locked balances (must be non-negative)
  sol_locked DECIMAL(20, 8) DEFAULT 0 CHECK (sol_locked >= 0),
  usdc_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_locked >= 0),
  usdt_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_locked >= 0),
  
  -- Lifetime statistics
  total_profit_earned DECIMAL(20, 8) DEFAULT 0 CHECK (total_profit_earned >= 0),
  total_deposited DECIMAL(20, 8) DEFAULT 0 CHECK (total_deposited >= 0),
  total_withdrawn DECIMAL(20, 8) DEFAULT 0 CHECK (total_withdrawn >= 0),
  
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure locked amounts don't exceed total
  CONSTRAINT valid_locked_sol CHECK (sol_locked <= sol_balance + sol_locked),
  CONSTRAINT valid_locked_usdc CHECK (usdc_locked <= usdc_balance + usdc_locked),
  CONSTRAINT valid_locked_usdt CHECK (usdt_locked <= usdt_balance + usdt_locked)
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'profit', 'refund')),
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC', 'USDT')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Blockchain verification
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
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  plan_name TEXT NOT NULL CHECK (length(plan_name) BETWEEN 1 AND 100),
  
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC', 'USDT')),
  
  daily_return DECIMAL(5, 2) NOT NULL CHECK (daily_return > 0 AND daily_return <= 100),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 365),
  expected_return DECIMAL(20, 8) NOT NULL CHECK (expected_return >= 0),
  
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ,
  maturity_date TIMESTAMPTZ NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  
  profit_earned DECIMAL(20, 8) DEFAULT 0 CHECK (profit_earned >= 0),
  last_profit_date TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure maturity date is after start date
  CONSTRAINT valid_maturity CHECK (maturity_date > start_date),
  -- Ensure end date is after start date if set
  CONSTRAINT valid_end_date CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================================================
-- USER SESSIONS TABLE (for JWT authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  
  session_token TEXT UNIQUE NOT NULL,
  signature TEXT NOT NULL,
  message TEXT NOT NULL,
  
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  ip_address INET,
  user_agent TEXT,
  
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = true;

-- Platform balances
CREATE INDEX IF NOT EXISTS idx_platform_balances_wallet ON platform_balances(wallet_address);
CREATE INDEX IF NOT EXISTS idx_platform_balances_user ON platform_balances(user_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash) WHERE tx_hash IS NOT NULL;

-- Investments
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_wallet ON investments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_maturity ON investments(maturity_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_investments_last_profit ON investments(last_profit_date) WHERE status = 'active';

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ============================================================================
-- FUNCTIONS FOR ATOMIC OPERATIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Atomic balance credit function
CREATE OR REPLACE FUNCTION credit_balance(
  p_wallet_address TEXT,
  p_amount DECIMAL(20, 8),
  p_currency TEXT
) RETURNS VOID AS $$
DECLARE
  v_column TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  v_column := lower(p_currency) || '_balance';
  
  EXECUTE format('
    UPDATE platform_balances
    SET %I = %I + $1,
        last_updated = NOW()
    WHERE wallet_address = $2
  ', v_column, v_column)
  USING p_amount, p_wallet_address;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found: %', p_wallet_address;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Atomic balance debit function
CREATE OR REPLACE FUNCTION debit_balance(
  p_wallet_address TEXT,
  p_amount DECIMAL(20, 8),
  p_currency TEXT
) RETURNS VOID AS $$
DECLARE
  v_column TEXT;
  v_current_balance DECIMAL(20, 8);
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  v_column := lower(p_currency) || '_balance';
  
  -- Check current balance
  EXECUTE format('SELECT %I FROM platform_balances WHERE wallet_address = $1', v_column)
  INTO v_current_balance
  USING p_wallet_address;
  
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found: %', p_wallet_address;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_current_balance, p_amount;
  END IF;
  
  EXECUTE format('
    UPDATE platform_balances
    SET %I = %I - $1,
        last_updated = NOW()
    WHERE wallet_address = $2
  ', v_column, v_column)
  USING p_amount, p_wallet_address;
END;
$$ LANGUAGE plpgsql;

-- Lock funds for investment
CREATE OR REPLACE FUNCTION lock_funds(
  p_wallet_address TEXT,
  p_amount DECIMAL(20, 8),
  p_currency TEXT
) RETURNS VOID AS $$
DECLARE
  v_balance_column TEXT;
  v_locked_column TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  v_balance_column := lower(p_currency) || '_balance';
  v_locked_column := lower(p_currency) || '_locked';
  
  EXECUTE format('
    UPDATE platform_balances
    SET %I = %I - $1,
        %I = %I + $1,
        last_updated = NOW()
    WHERE wallet_address = $2
    AND %I >= $1
  ', v_balance_column, v_balance_column, v_locked_column, v_locked_column, v_balance_column)
  USING p_amount, p_wallet_address;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or wallet not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Unlock funds from investment
CREATE OR REPLACE FUNCTION unlock_funds(
  p_wallet_address TEXT,
  p_amount DECIMAL(20, 8),
  p_currency TEXT
) RETURNS VOID AS $$
DECLARE
  v_balance_column TEXT;
  v_locked_column TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  v_balance_column := lower(p_currency) || '_balance';
  v_locked_column := lower(p_currency) || '_locked';
  
  EXECUTE format('
    UPDATE platform_balances
    SET %I = %I + $1,
        %I = GREATEST(%I - $1, 0),
        last_updated = NOW()
    WHERE wallet_address = $2
  ', v_balance_column, v_balance_column, v_locked_column, v_locked_column)
  USING p_amount, p_wallet_address;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found: %', p_wallet_address;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on investments
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at 
  BEFORE UPDATE ON investments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'User profile information with wallet-based authentication';
COMMENT ON TABLE platform_balances IS 'Platform balance tracking with atomic operations support';
COMMENT ON TABLE transactions IS 'All financial transactions with blockchain verification';
COMMENT ON TABLE investments IS 'Investment plans with daily return tracking';
COMMENT ON TABLE user_sessions IS 'JWT session management with wallet signature verification';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for all database operations';

COMMENT ON FUNCTION credit_balance IS 'Atomically credit balance to prevent race conditions';
COMMENT ON FUNCTION debit_balance IS 'Atomically debit balance with insufficient funds check';
COMMENT ON FUNCTION lock_funds IS 'Lock funds for investment with atomic operation';
COMMENT ON FUNCTION unlock_funds IS 'Unlock funds from completed investment';
