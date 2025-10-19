import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Check if we have real credentials
const hasRealCredentials =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder_key';

if (!hasRealCredentials) {
  console.warn('⚠️ Supabase credentials not configured. Database features disabled. Using localStorage fallback.');
  console.info('📝 To enable database features:');
  console.info('1. Create a Supabase project at https://app.supabase.com');
  console.info('2. Update .env file with your project URL and anon key');
  console.info('3. Run the schema from supabase-schema.sql in Supabase SQL Editor');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id?: string;
  wallet_address: string;
  username: string;
  display_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  country: string;
  country_code: string;
  profile_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: string;
  user_id: string;
  wallet_address: string;
  type: 'deposit' | 'withdraw' | 'investment' | 'profit' | 'loss';
  amount: number;
  currency: 'SOL' | 'USDC' | 'USDT';
  status: 'pending' | 'completed' | 'failed';
  transaction_hash?: string;
  description?: string;
  created_at?: string;
}

export interface Investment {
  id?: string;
  user_id: string;
  wallet_address: string;
  plan_name: string;
  amount: number;
  currency: 'SOL' | 'USDC' | 'USDT';
  daily_return: number; // Daily return percentage
  duration_days: number; // Investment duration in days
  expected_return: number; // Total expected profit
  start_date: string;
  end_date?: string;
  maturity_date: string; // Calculated maturity date
  status: 'active' | 'completed' | 'cancelled';
  profit_earned: number;
  last_profit_date?: string; // Last time profit was credited
  created_at?: string;
  updated_at?: string;
}

export interface PlatformBalance {
  id?: string;
  user_id: string;
  wallet_address: string;
  sol_balance: number; // Available balance
  usdc_balance: number;
  usdt_balance: number;
  sol_locked: number; // Amount locked in investments
  usdc_locked: number;
  usdt_locked: number;
  total_profit_earned: number; // Lifetime profits
  last_updated?: string;
  created_at?: string;
}

// Supported SPL tokens on Solana
export const SOLANA_TOKENS = {
  SOL: 'native', // Native SOL
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC SPL Token
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT SPL Token
} as const;
