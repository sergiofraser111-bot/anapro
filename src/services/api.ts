import { query } from '../lib/database';
import type { UserProfile, PlatformBalance, Transaction, Investment } from '../lib/database';

/**
 * Create new user profile
 */
export async function createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'login_count' | 'last_login_at'>): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const result = await query<UserProfile>(
      `INSERT INTO users (
        wallet_address, username, display_name, email, phone,
        date_of_birth, country, country_code, profile_complete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        profile.wallet_address,
        profile.username,
        profile.display_name,
        profile.email,
        profile.phone || null,
        profile.date_of_birth || null,
        profile.country,
        profile.country_code,
        profile.profile_complete
      ]
    );

    if (result.length === 0) {
      return { data: null, error: 'Failed to create profile' };
    }

    // Initialize platform balance
    await query(
      `INSERT INTO platform_balances (user_id, wallet_address)
       VALUES ($1, $2)`,
      [result[0].id, profile.wallet_address]
    );

    return { data: result[0], error: null };
  } catch (error: any) {
    if (error.message.includes('duplicate key')) {
      if (error.message.includes('wallet_address')) {
        return { data: null, error: 'Wallet address already registered' };
      }
      if (error.message.includes('username')) {
        return { data: null, error: 'Username already taken' };
      }
      if (error.message.includes('email')) {
        return { data: null, error: 'Email already registered' };
      }
    }
    return { data: null, error: error.message };
  }
}

/**
 * Get user profile by wallet address
 */
export async function getUserProfile(walletAddress: string): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const result = await query<UserProfile>(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );

    if (result.length === 0) {
      return { data: null, error: 'User not found' };
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: Partial<Omit<UserProfile, 'id' | 'wallet_address' | 'created_at' | 'updated_at'>>
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (fields.length === 0) {
      return { data: null, error: 'No fields to update' };
    }

    values.push(walletAddress);

    const result = await query<UserProfile>(
      `UPDATE users SET ${fields.join(', ')} WHERE wallet_address = $${paramIndex} RETURNING *`,
      values
    );

    if (result.length === 0) {
      return { data: null, error: 'User not found' };
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get platform balance
 */
export async function getPlatformBalance(walletAddress: string): Promise<{ data: PlatformBalance | null; error: string | null }> {
  try {
    const result = await query<PlatformBalance>(
      'SELECT * FROM platform_balances WHERE wallet_address = $1',
      [walletAddress]
    );

    if (result.length === 0) {
      return { data: null, error: 'Balance not found' };
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Create transaction
 */
export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'tx_verified' | 'tx_verified_at'>
): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const result = await query<Transaction>(
      `INSERT INTO transactions (
        user_id, wallet_address, type, amount, currency, status, tx_hash, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        transaction.user_id,
        transaction.wallet_address,
        transaction.type,
        transaction.amount,
        transaction.currency,
        transaction.status,
        transaction.tx_hash || null,
        transaction.description || null,
        transaction.metadata ? JSON.stringify(transaction.metadata) : null
      ]
    );

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(walletAddress: string): Promise<{ data: Transaction[]; error: string | null }> {
  try {
    const result = await query<Transaction>(
      'SELECT * FROM transactions WHERE wallet_address = $1 ORDER BY created_at DESC',
      [walletAddress]
    );

    return { data: result, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'completed' | 'failed' | 'cancelled',
  txHash?: string
): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const result = await query<Transaction>(
      `UPDATE transactions 
       SET status = $1, tx_hash = COALESCE($2, tx_hash), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, txHash || null, transactionId]
    );

    if (result.length === 0) {
      return { data: null, error: 'Transaction not found' };
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Create investment
 */
export async function createInvestment(
  investment: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'profit_earned' | 'last_profit_date' | 'end_date'>
): Promise<{ data: Investment | null; error: string | null }> {
  try {
    const result = await query<Investment>(
      `INSERT INTO investments (
        user_id, wallet_address, plan_name, amount, currency,
        daily_return, duration_days, expected_return, maturity_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        investment.user_id,
        investment.wallet_address,
        investment.plan_name,
        investment.amount,
        investment.currency,
        investment.daily_return,
        investment.duration_days,
        investment.expected_return,
        investment.maturity_date,
        investment.status
      ]
    );

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get user investments
 */
export async function getUserInvestments(walletAddress: string): Promise<{ data: Investment[]; error: string | null }> {
  try {
    const result = await query<Investment>(
      'SELECT * FROM investments WHERE wallet_address = $1 ORDER BY created_at DESC',
      [walletAddress]
    );

    return { data: result, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

/**
 * Update investment
 */
export async function updateInvestment(
  investmentId: string,
  updates: Partial<Omit<Investment, 'id' | 'user_id' | 'wallet_address' | 'created_at' | 'updated_at'>>
): Promise<{ data: Investment | null; error: string | null }> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (fields.length === 0) {
      return { data: null, error: 'No fields to update' };
    }

    values.push(investmentId);

    const result = await query<Investment>(
      `UPDATE investments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.length === 0) {
      return { data: null, error: 'Investment not found' };
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
