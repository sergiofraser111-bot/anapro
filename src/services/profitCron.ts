import { supabase } from '../lib/supabase';
import { creditDailyProfit } from './platformBalance';
import type { Investment } from '../lib/supabase';

/**
 * Calculate daily profit for an investment based on its daily return percentage
 */
const calculateDailyProfit = (investment: Investment): number => {
  const dailyReturnRate = investment.daily_return / 100; // Convert percentage to decimal
  return investment.amount * dailyReturnRate;
};

/**
 * Check if profit should be credited today
 * Profits are credited once per day
 */
const shouldCreditToday = (lastProfitDate: string | undefined): boolean => {
  if (!lastProfitDate) return true; // First profit credit

  const lastCredit = new Date(lastProfitDate);
  const now = new Date();

  // Check if last credit was on a different day
  return (
    lastCredit.getDate() !== now.getDate() ||
    lastCredit.getMonth() !== now.getMonth() ||
    lastCredit.getFullYear() !== now.getFullYear()
  );
};

/**
 * Check if investment has reached maturity
 */
const hasReachedMaturity = (investment: Investment): boolean => {
  const maturityDate = new Date(investment.maturity_date);
  const now = new Date();
  return now >= maturityDate;
};

/**
 * Process profit for a single investment
 */
export const processInvestmentProfit = async (investment: Investment) => {
  try {
    // Check if already processed today
    if (!shouldCreditToday(investment.last_profit_date)) {
      console.log(`Investment ${investment.id} already credited today`);
      return { success: true, skipped: true };
    }

    // Calculate daily profit
    const dailyProfit = calculateDailyProfit(investment);
    const newTotalProfit = (investment.profit_earned || 0) + dailyProfit;

    // Credit profit to user's available balance
    const { error: creditError } = await creditDailyProfit(
      investment.wallet_address,
      dailyProfit,
      investment.currency as 'SOL' | 'USDC' | 'USDT'
    );

    if (creditError) {
      console.error(`Failed to credit profit for investment ${investment.id}:`, creditError);
      return { success: false, error: creditError };
    }

    // Update investment record with new profit and last_profit_date
    const updateData: any = {
      profit_earned: newTotalProfit,
      last_profit_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if investment has reached maturity
    if (hasReachedMaturity(investment)) {
      updateData.status = 'completed';
      updateData.end_date = new Date().toISOString();

      // Unlock the principal amount (profit already added to available balance)
      // This is handled by unlockFundsFromInvestment which we'll call separately
      console.log(`Investment ${investment.id} has reached maturity`);
    }

    const { error: updateError } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', investment.id);

    if (updateError) {
      console.error(`Failed to update investment ${investment.id}:`, updateError);
      return { success: false, error: updateError.message };
    }

    // Create transaction record for the profit
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: investment.user_id,
        wallet_address: investment.wallet_address,
        type: 'profit',
        amount: dailyProfit,
        currency: investment.currency,
        status: 'completed',
        description: `Daily profit from ${investment.plan_name}`,
      });

    if (txError) {
      console.error(`Failed to create profit transaction:`, txError);
    }

    console.log(`✅ Credited ${dailyProfit} ${investment.currency} profit to ${investment.wallet_address}`);

    return {
      success: true,
      profitCredited: dailyProfit,
      totalProfit: newTotalProfit,
      completed: updateData.status === 'completed'
    };
  } catch (error: any) {
    console.error(`Error processing investment ${investment.id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Process profits for all active investments
 * This should be run as a cron job (daily)
 */
export const processDailyProfits = async () => {
  console.log('🔄 Starting daily profit processing...');

  try {
    // Fetch all active investments
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Failed to fetch active investments:', error);
      return { success: false, error: error.message };
    }

    if (!investments || investments.length === 0) {
      console.log('No active investments to process');
      return { success: true, processed: 0 };
    }

    console.log(`Found ${investments.length} active investments`);

    // Process each investment
    const results = await Promise.all(
      investments.map(investment => processInvestmentProfit(investment))
    );

    // Count successes and failures
    const successful = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;
    const completed = results.filter(r => r.completed).length;

    console.log(`✅ Profit processing complete:`);
    console.log(`   - Processed: ${successful}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Completed: ${completed}`);

    return {
      success: true,
      processed: successful,
      skipped,
      failed,
      completed,
      total: investments.length
    };
  } catch (error: any) {
    console.error('Error in daily profit processing:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete matured investments (unlock principal)
 * This should also be run as a cron job
 */
export const completeMaturedInvestments = async () => {
  console.log('🔄 Checking for matured investments...');

  try {
    const now = new Date().toISOString();

    // Find investments that have reached maturity
    const { data: maturedInvestments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('status', 'completed')
      .is('end_date', null); // Completed but not yet fully processed

    if (error) {
      console.error('Failed to fetch matured investments:', error);
      return { success: false, error: error.message };
    }

    if (!maturedInvestments || maturedInvestments.length === 0) {
      console.log('No matured investments to process');
      return { success: true, processed: 0 };
    }

    console.log(`Found ${maturedInvestments.length} matured investments`);

    // Import unlockFundsFromInvestment
    const { unlockFundsFromInvestment } = await import('./platformBalance');

    // Process each matured investment
    for (const investment of maturedInvestments) {
      // Unlock principal (profit already in available balance)
      const { error: unlockError } = await unlockFundsFromInvestment(
        investment.wallet_address,
        investment.amount, // principal
        0, // profit already credited daily
        investment.currency as 'SOL' | 'USDC' | 'USDT'
      );

      if (unlockError) {
        console.error(`Failed to unlock funds for investment ${investment.id}:`, unlockError);
        continue;
      }

      // Update investment with end_date
      const { error: updateError } = await supabase
        .from('investments')
        .update({
          end_date: now,
          updated_at: now,
        })
        .eq('id', investment.id);

      if (updateError) {
        console.error(`Failed to update investment ${investment.id}:`, updateError);
      }

      // Create refund transaction for principal
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: investment.user_id,
          wallet_address: investment.wallet_address,
          type: 'refund',
          amount: investment.amount,
          currency: investment.currency,
          status: 'completed',
          description: `Principal returned from completed ${investment.plan_name}`,
        });

      if (txError) {
        console.error(`Failed to create refund transaction:`, txError);
      }

      console.log(`✅ Unlocked ${investment.amount} ${investment.currency} principal for ${investment.wallet_address}`);
    }

    return {
      success: true,
      processed: maturedInvestments.length
    };
  } catch (error: any) {
    console.error('Error completing matured investments:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main cron job function - runs both daily profit processing and maturity completion
 */
export const runProfitCron = async () => {
  console.log('⏰ Running profit cron job...');

  // Process daily profits
  const profitResults = await processDailyProfits();

  // Complete matured investments
  const maturityResults = await completeMaturedInvestments();

  console.log('✅ Cron job completed');

  return {
    profits: profitResults,
    maturity: maturityResults
  };
};
