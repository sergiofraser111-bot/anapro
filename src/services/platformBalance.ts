import { query } from '../lib/database';
import type { PlatformBalance } from '../lib/database';

export type Currency = 'SOL' | 'USDC' | 'USDT';

/**
 * Get platform balance for a wallet
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
 * Initialize platform balance for new user
 */
export async function initializePlatformBalance(
  walletAddress: string,
  userId: string
): Promise<{ data: PlatformBalance | null; error: string | null }> {
  try {
    const result = await query<PlatformBalance>(
      `INSERT INTO platform_balances (user_id, wallet_address)
       VALUES ($1, $2)
       ON CONFLICT (wallet_address) DO NOTHING
       RETURNING *`,
      [userId, walletAddress]
    );

    if (result.length === 0) {
      // Already exists, fetch it
      return getPlatformBalance(walletAddress);
    }

    return { data: result[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Credit deposit using atomic database function
 */
export async function creditDeposit(
  walletAddress: string,
  amount: number,
  currency: Currency
): Promise<{ error: string | null }> {
  try {
    if (amount <= 0) {
      return { error: 'Amount must be positive' };
    }

    // Use atomic database function
    await query(
      'SELECT credit_balance($1, $2, $3)',
      [walletAddress, amount, currency]
    );

    // Update total deposited
    await query(
      `UPDATE platform_balances 
       SET total_deposited = total_deposited + $1
       WHERE wallet_address = $2`,
      [amount, walletAddress]
    );

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Debit withdrawal using atomic database function
 */
export async function debitWithdrawal(
  walletAddress: string,
  amount: number,
  currency: Currency
): Promise<{ error: string | null }> {
  try {
    if (amount <= 0) {
      return { error: 'Amount must be positive' };
    }

    // Use atomic database function
    await query(
      'SELECT debit_balance($1, $2, $3)',
      [walletAddress, amount, currency]
    );

    // Update total withdrawn
    await query(
      `UPDATE platform_balances 
       SET total_withdrawn = total_withdrawn + $1
       WHERE wallet_address = $2`,
      [amount, walletAddress]
    );

    return { error: null };
  } catch (error: any) {
    if (error.message.includes('Insufficient balance')) {
      return { error: 'Insufficient balance' };
    }
    return { error: error.message };
  }
}

/**
 * Lock funds for investment using atomic database function
 */
export async function lockFundsForInvestment(
  walletAddress: string,
  amount: number,
  currency: Currency
): Promise<{ error: string | null }> {
  try {
    if (amount <= 0) {
      return { error: 'Amount must be positive' };
    }

    // Use atomic database function
    await query(
      'SELECT lock_funds($1, $2, $3)',
      [walletAddress, amount, currency]
    );

    return { error: null };
  } catch (error: any) {
    if (error.message.includes('Insufficient balance')) {
      return { error: 'Insufficient balance for investment' };
    }
    return { error: error.message };
  }
}

/**
 * Unlock funds from completed/cancelled investment using atomic database function
 */
export async function unlockFundsFromInvestment(
  walletAddress: string,
  principalAmount: number,
  profitAmount: number,
  currency: Currency
): Promise<{ error: string | null }> {
  try {
    if (principalAmount < 0 || profitAmount < 0) {
      return { error: 'Amounts must be non-negative' };
    }

    const totalAmount = principalAmount + profitAmount;

    if (totalAmount > 0) {
      // Use atomic database function
      await query(
        'SELECT unlock_funds($1, $2, $3)',
        [walletAddress, totalAmount, currency]
      );
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Credit daily profit using atomic database function
 */
export async function creditDailyProfit(
  walletAddress: string,
  profitAmount: number,
  currency: Currency
): Promise<{ error: string | null }> {
  try {
    if (profitAmount <= 0) {
      return { error: 'Profit amount must be positive' };
    }

    // Use atomic database function
    await query(
      'SELECT credit_balance($1, $2, $3)',
      [walletAddress, profitAmount, currency]
    );

    // Update total profit earned
    await query(
      `UPDATE platform_balances 
       SET total_profit_earned = total_profit_earned + $1
       WHERE wallet_address = $2`,
      [profitAmount, walletAddress]
    );

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Get available balance for a specific currency
 */
export async function getAvailableBalance(
  walletAddress: string,
  currency: Currency
): Promise<number> {
  try {
    const { data } = await getPlatformBalance(walletAddress);

    if (!data) {
      return 0;
    }

    const currencyLower = currency.toLowerCase();
    const balanceField = `${currencyLower}_balance` as keyof PlatformBalance;

    return Number(data[balanceField]) || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get total balance (available + locked) for all currencies
 */
export async function getTotalBalance(walletAddress: string): Promise<{
  sol: { available: number; locked: number; total: number };
  usdc: { available: number; locked: number; total: number };
  usdt: { available: number; locked: number; total: number };
  totalProfit: number;
}> {
  try {
    const { data } = await getPlatformBalance(walletAddress);

    if (!data) {
      return {
        sol: { available: 0, locked: 0, total: 0 },
        usdc: { available: 0, locked: 0, total: 0 },
        usdt: { available: 0, locked: 0, total: 0 },
        totalProfit: 0
      };
    }

    return {
      sol: {
        available: Number(data.sol_balance),
        locked: Number(data.sol_locked),
        total: Number(data.sol_balance) + Number(data.sol_locked)
      },
      usdc: {
        available: Number(data.usdc_balance),
        locked: Number(data.usdc_locked),
        total: Number(data.usdc_balance) + Number(data.usdc_locked)
      },
      usdt: {
        available: Number(data.usdt_balance),
        locked: Number(data.usdt_locked),
        total: Number(data.usdt_balance) + Number(data.usdt_locked)
      },
      totalProfit: Number(data.total_profit_earned)
    };
  } catch (error) {
    return {
      sol: { available: 0, locked: 0, total: 0 },
      usdc: { available: 0, locked: 0, total: 0 },
      usdt: { available: 0, locked: 0, total: 0 },
      totalProfit: 0
    };
  }
}

/**
 * Check if user has sufficient balance for investment
 */
export async function hasSufficientBalance(
  walletAddress: string,
  amount: number,
  currency: Currency
): Promise<boolean> {
  try {
    const availableBalance = await getAvailableBalance(walletAddress, currency);
    return availableBalance >= amount;
  } catch (error) {
    return false;
  }
}
