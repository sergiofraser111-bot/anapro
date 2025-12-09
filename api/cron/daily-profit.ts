import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, Investment } from '../../src/lib/database.js';
import { creditDailyProfit } from '../../src/services/platformBalance.js';

const calculateDailyProfit = (investment: Investment): number => {
  const dailyReturnRate = investment.daily_return / 100;
  return investment.amount * dailyReturnRate;
};

const shouldCreditToday = (lastProfitDate: string | undefined): boolean => {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch all active investments
    const investments = await query<Investment>(
      "SELECT * FROM investments WHERE status = 'active'"
    );

    if (!investments || investments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active investments to process',
        processed: 0
      });
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;
    let completed = 0;

    // Process each investment
    for (const investment of investments) {
      try {
        // Check if already processed today
        if (!shouldCreditToday(investment.last_profit_date)) {
          skipped++;
          continue;
        }

        // Calculate daily profit
        const dailyProfit = calculateDailyProfit(investment);
        const newTotalProfit = (investment.profit_earned || 0) + dailyProfit;

        // Credit profit using atomic function
        const { error: creditError } = await creditDailyProfit(
          investment.wallet_address,
          dailyProfit,
          investment.currency as 'SOL' | 'USDC' | 'USDT'
        );

        if (creditError) {
          failed++;
          continue;
        }

        // Update investment record
        const updateData: any = {
          profit_earned: newTotalProfit,
          last_profit_date: new Date().toISOString(),
        };

        // Check if investment has reached maturity
        if (hasReachedMaturity(investment)) {
          updateData.status = 'completed';
          updateData.end_date = new Date().toISOString();
          completed++;
        }

        await query(
          `UPDATE investments 
           SET profit_earned = $1, last_profit_date = $2, status = COALESCE($3, status), end_date = COALESCE($4, end_date)
           WHERE id = $5`,
          [newTotalProfit, updateData.last_profit_date, updateData.status, updateData.end_date, investment.id]
        );

        // Create transaction record for the profit
        await query(
          `INSERT INTO transactions (user_id, wallet_address, type, amount, currency, status, description)
           VALUES ($1, $2, 'profit', $3, $4, 'completed', $5)`,
          [investment.user_id, investment.wallet_address, dailyProfit, investment.currency, `Daily profit from ${investment.plan_name}`]
        );

        processed++;
      } catch (error: any) {
        failed++;
      }
    }

    // Complete matured investments (unlock principal)
    const maturedInvestments = await query<Investment>(
      "SELECT * FROM investments WHERE status = 'completed' AND end_date IS NULL"
    );

    let maturedProcessed = 0;

    if (maturedInvestments && maturedInvestments.length > 0) {
      const { unlockFundsFromInvestment } = await import('../../src/services/platformBalance');

      for (const investment of maturedInvestments) {
        try {
          // Unlock principal to available balance
          const { error: unlockError } = await unlockFundsFromInvestment(
            investment.wallet_address,
            investment.amount,
            0,
            investment.currency as 'SOL' | 'USDC' | 'USDT'
          );

          if (unlockError) {
            continue;
          }

          // Mark as fully processed
          await query(
            'UPDATE investments SET end_date = NOW() WHERE id = $1',
            [investment.id]
          );

          // Create refund transaction
          await query(
            `INSERT INTO transactions (user_id, wallet_address, type, amount, currency, status, description)
             VALUES ($1, $2, 'refund', $3, $4, 'completed', $5)`,
            [investment.user_id, investment.wallet_address, investment.amount, investment.currency, `Principal returned from completed ${investment.plan_name}`]
          );

          maturedProcessed++;
        } catch (error: any) {
          // Continue processing other investments
        }
      }
    }

    return res.status(200).json({
      success: true,
      profits: {
        total: investments.length,
        processed,
        skipped,
        failed,
        completed
      },
      maturity: {
        processed: maturedProcessed
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
