import { query } from '../lib/database';
import type { Investment } from '../lib/database';
import { creditDailyProfit } from './platformBalance';

const calculateDailyProfit = (investment: Investment): number => {
  const dailyReturnRate = investment.daily_return / 100;
  return investment.amount * dailyReturnRate;
};

const shouldCreditToday = (lastProfitDate: Date | string | undefined): boolean => {
  if (!lastProfitDate) return true;
  const lastCredit = new Date(lastProfitDate);
  const now = new Date();
  return (
    lastCredit.getDate() !== now.getDate() ||
    lastCredit.getMonth() !== now.getMonth() ||
    lastCredit.getFullYear() !== now.getFullYear()
  );
};

const hasReachedMaturity = (investment: Investment): boolean => {
  const maturityDate = new Date(investment.maturity_date);
  const now = new Date();
  return now >= maturityDate;
};

export const processInvestmentProfit = async (investment: Investment) => {
  try {
    if (!shouldCreditToday(investment.last_profit_date)) {
      return { success: true, skipped: true };
    }

    const dailyProfit = calculateDailyProfit(investment);
    const newTotalProfit = (investment.profit_earned || 0) + dailyProfit;

    const { error: creditError } = await creditDailyProfit(
      investment.wallet_address,
      dailyProfit,
      investment.currency as 'SOL' | 'USDC' | 'USDT'
    );

    if (creditError) {
      return { success: false, error: creditError };
    }

    const updateData: any = {
      profit_earned: newTotalProfit,
      last_profit_date: new Date().toISOString(),
    };

    if (hasReachedMaturity(investment)) {
      updateData.status = 'completed';
      updateData.end_date = new Date().toISOString();
    }

    await query(
      `UPDATE investments 
       SET profit_earned = $1, last_profit_date = $2, status = COALESCE($3, status), end_date = COALESCE($4, end_date)
       WHERE id = $5`,
      [newTotalProfit, updateData.last_profit_date, updateData.status, updateData.end_date, investment.id]
    );

    await query(
      `INSERT INTO transactions (user_id, wallet_address, type, amount, currency, status, description)
       VALUES ($1, $2, 'profit', $3, $4, 'completed', $5)`,
      [investment.user_id, investment.wallet_address, dailyProfit, investment.currency, `Daily profit from ${investment.plan_name}`]
    );

    return {
      success: true,
      profitCredited: dailyProfit,
      totalProfit: newTotalProfit,
      completed: updateData.status === 'completed'
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const processDailyProfits = async () => {
  try {
    const investments = await query<Investment>(
      "SELECT * FROM investments WHERE status = 'active'"
    );

    if (!investments || investments.length === 0) {
      return { success: true, processed: 0 };
    }

    const results = await Promise.all(
      investments.map(investment => processInvestmentProfit(investment))
    );

    const successful = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;
    const completed = results.filter(r => r.completed).length;

    return {
      success: true,
      processed: successful,
      skipped,
      failed,
      completed,
      total: investments.length
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const completeMaturedInvestments = async () => {
  try {
    const maturedInvestments = await query<Investment>(
      "SELECT * FROM investments WHERE status = 'completed' AND end_date IS NULL"
    );

    if (!maturedInvestments || maturedInvestments.length === 0) {
      return { success: true, processed: 0 };
    }

    const { unlockFundsFromInvestment } = await import('./platformBalance');

    for (const investment of maturedInvestments) {
      const { error: unlockError } = await unlockFundsFromInvestment(
        investment.wallet_address,
        investment.amount,
        0,
        investment.currency as 'SOL' | 'USDC' | 'USDT'
      );

      if (unlockError) {
        continue;
      }

      await query(
        'UPDATE investments SET end_date = NOW() WHERE id = $1',
        [investment.id]
      );

      await query(
        `INSERT INTO transactions (user_id, wallet_address, type, amount, currency, status, description)
         VALUES ($1, $2, 'refund', $3, $4, 'completed', $5)`,
        [investment.user_id, investment.wallet_address, investment.amount, investment.currency, `Principal returned from completed ${investment.plan_name}`]
      );
    }

    return {
      success: true,
      processed: maturedInvestments.length
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const runProfitCron = async () => {
  const profitResults = await processDailyProfits();
  const maturityResults = await completeMaturedInvestments();

  return {
    profits: profitResults,
    maturity: maturityResults
  };
};
