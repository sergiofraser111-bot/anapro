import { supabase } from '../lib/supabase';
import type { PlatformBalance } from '../lib/supabase';

type Currency = 'SOL' | 'USDC' | 'USDT';

/**
 * Get user's platform balance
 */
export const getPlatformBalance = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('platform_balances')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching platform balance:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Initialize platform balance for new user
 */
export const initializePlatformBalance = async (walletAddress: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('platform_balances')
      .insert([{
        user_id: userId,
        wallet_address: walletAddress,
        sol_balance: 0,
        usdc_balance: 0,
        usdt_balance: 0,
        sol_locked: 0,
        usdc_locked: 0,
        usdt_locked: 0,
        total_profit_earned: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error initializing platform balance:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Credit deposit to platform balance
 */
export const creditDeposit = async (
  walletAddress: string,
  amount: number,
  currency: Currency
) => {
  try {
    // Get current balance
    const { data: currentBalance } = await getPlatformBalance(walletAddress);

    if (!currentBalance) {
      return { data: null, error: 'Platform balance not found. Please initialize first.' };
    }

    const currencyField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    const currentAmount = (currentBalance[currencyField] as number) || 0;
    const newAmount = currentAmount + amount;

    const { data, error } = await supabase
      .from('platform_balances')
      .update({
        [currencyField]: newAmount,
        last_updated: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error crediting deposit:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Debit withdrawal from platform balance
 */
export const debitWithdrawal = async (
  walletAddress: string,
  amount: number,
  currency: Currency
) => {
  try {
    // Get current balance
    const { data: currentBalance } = await getPlatformBalance(walletAddress);

    if (!currentBalance) {
      return { data: null, error: 'Platform balance not found' };
    }

    const currencyField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    const currentAmount = (currentBalance[currencyField] as number) || 0;

    // Check if sufficient balance
    if (currentAmount < amount) {
      return { data: null, error: 'Insufficient balance' };
    }

    const newAmount = currentAmount - amount;

    const { data, error } = await supabase
      .from('platform_balances')
      .update({
        [currencyField]: newAmount,
        last_updated: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error debiting withdrawal:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Lock funds for investment
 */
export const lockFundsForInvestment = async (
  walletAddress: string,
  amount: number,
  currency: Currency
) => {
  try {
    // Get current balance
    const { data: currentBalance } = await getPlatformBalance(walletAddress);

    if (!currentBalance) {
      return { data: null, error: 'Platform balance not found' };
    }

    const balanceField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    const lockedField = `${currency.toLowerCase()}_locked` as keyof PlatformBalance;

    const currentAvailable = (currentBalance[balanceField] as number) || 0;
    const currentLocked = (currentBalance[lockedField] as number) || 0;

    // Check if sufficient available balance
    if (currentAvailable < amount) {
      return { data: null, error: 'Insufficient available balance for investment' };
    }

    const newAvailable = currentAvailable - amount;
    const newLocked = currentLocked + amount;

    const { data, error} = await supabase
      .from('platform_balances')
      .update({
        [balanceField]: newAvailable,
        [lockedField]: newLocked,
        last_updated: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error locking funds:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Unlock funds from completed/cancelled investment
 */
export const unlockFundsFromInvestment = async (
  walletAddress: string,
  principalAmount: number,
  profitAmount: number,
  currency: Currency
) => {
  try {
    // Get current balance
    const { data: currentBalance } = await getPlatformBalance(walletAddress);

    if (!currentBalance) {
      return { data: null, error: 'Platform balance not found' };
    }

    const balanceField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    const lockedField = `${currency.toLowerCase()}_locked` as keyof PlatformBalance;

    const currentAvailable = (currentBalance[balanceField] as number) || 0;
    const currentLocked = (currentBalance[lockedField] as number) || 0;
    const totalProfit = currentBalance.total_profit_earned || 0;

    // Return principal + profit to available balance
    const newAvailable = currentAvailable + principalAmount + profitAmount;
    const newLocked = Math.max(0, currentLocked - principalAmount);
    const newTotalProfit = totalProfit + profitAmount;

    const { data, error } = await supabase
      .from('platform_balances')
      .update({
        [balanceField]: newAvailable,
        [lockedField]: newLocked,
        total_profit_earned: newTotalProfit,
        last_updated: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error unlocking funds:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Credit daily profit to available balance
 */
export const creditDailyProfit = async (
  walletAddress: string,
  profitAmount: number,
  currency: Currency
) => {
  try {
    // Get current balance
    const { data: currentBalance } = await getPlatformBalance(walletAddress);

    if (!currentBalance) {
      return { data: null, error: 'Platform balance not found' };
    }

    const balanceField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    const currentAvailable = (currentBalance[balanceField] as number) || 0;
    const totalProfit = currentBalance.total_profit_earned || 0;

    const newAvailable = currentAvailable + profitAmount;
    const newTotalProfit = totalProfit + profitAmount;

    const { data, error } = await supabase
      .from('platform_balances')
      .update({
        [balanceField]: newAvailable,
        total_profit_earned: newTotalProfit,
        last_updated: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error crediting profit:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get available balance for a specific currency
 */
export const getAvailableBalance = async (
  walletAddress: string,
  currency: Currency
): Promise<number> => {
  try {
    const { data } = await getPlatformBalance(walletAddress);
    if (!data) return 0;

    const balanceField = `${currency.toLowerCase()}_balance` as keyof PlatformBalance;
    return (data[balanceField] as number) || 0;
  } catch (error) {
    console.error('Error getting available balance:', error);
    return 0;
  }
};

/**
 * Get total balance (available + locked) for all currencies
 */
export const getTotalBalance = async (walletAddress: string) => {
  try {
    const { data } = await getPlatformBalance(walletAddress);
    if (!data) {
      return {
        sol: { available: 0, locked: 0, total: 0 },
        usdc: { available: 0, locked: 0, total: 0 },
        usdt: { available: 0, locked: 0, total: 0 },
        totalProfit: 0,
      };
    }

    return {
      sol: {
        available: data.sol_balance || 0,
        locked: data.sol_locked || 0,
        total: (data.sol_balance || 0) + (data.sol_locked || 0),
      },
      usdc: {
        available: data.usdc_balance || 0,
        locked: data.usdc_locked || 0,
        total: (data.usdc_balance || 0) + (data.usdc_locked || 0),
      },
      usdt: {
        available: data.usdt_balance || 0,
        locked: data.usdt_locked || 0,
        total: (data.usdt_balance || 0) + (data.usdt_locked || 0),
      },
      totalProfit: data.total_profit_earned || 0,
    };
  } catch (error) {
    console.error('Error getting total balance:', error);
    return {
      sol: { available: 0, locked: 0, total: 0 },
      usdc: { available: 0, locked: 0, total: 0 },
      usdt: { available: 0, locked: 0, total: 0 },
      totalProfit: 0,
    };
  }
};

/**
 * Check if user has sufficient balance for investment
 */
export const hasSufficientBalance = async (
  walletAddress: string,
  amount: number,
  currency: Currency
): Promise<boolean> => {
  try {
    const availableBalance = await getAvailableBalance(walletAddress, currency);
    return availableBalance >= amount;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
};
