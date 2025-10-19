import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Profit calculation logic
const calculateDailyProfit = (investment: any): number => {
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

const hasReachedMaturity = (investment: any): boolean => {
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
    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Note: Service role key, not anon key
    );

    console.log('Starting daily profit processing...');

    // Fetch all active investments
    const { data: investments, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('status', 'active');

    if (fetchError) {
      console.error('Failed to fetch investments:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

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

        // Get current platform balance
        const { data: platformBalance } = await supabase
          .from('platform_balances')
          .select('*')
          .eq('wallet_address', investment.wallet_address)
          .single();

        if (!platformBalance) {
          console.error(`Platform balance not found for ${investment.wallet_address}`);
          failed++;
          continue;
        }

        // Update platform balance - credit profit to available balance
        const currencyField = `${investment.currency.toLowerCase()}_balance`;
        const currentBalance = platformBalance[currencyField] || 0;
        const newBalance = currentBalance + dailyProfit;

        const { error: balanceError } = await supabase
          .from('platform_balances')
          .update({
            [currencyField]: newBalance,
            total_profit_earned: (platformBalance.total_profit_earned || 0) + dailyProfit,
            last_updated: new Date().toISOString(),
          })
          .eq('wallet_address', investment.wallet_address);

        if (balanceError) {
          console.error(`Failed to credit balance:`, balanceError);
          failed++;
          continue;
        }

        // Update investment record
        const updateData: any = {
          profit_earned: newTotalProfit,
          last_profit_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Check if investment has reached maturity
        if (hasReachedMaturity(investment)) {
          updateData.status = 'completed';
          updateData.end_date = new Date().toISOString();
          completed++;
        }

        const { error: updateError } = await supabase
          .from('investments')
          .update(updateData)
          .eq('id', investment.id);

        if (updateError) {
          console.error(`Failed to update investment:`, updateError);
          failed++;
          continue;
        }

        // Create transaction record for the profit
        await supabase.from('transactions').insert({
          user_id: investment.user_id,
          wallet_address: investment.wallet_address,
          type: 'profit',
          amount: dailyProfit,
          currency: investment.currency,
          status: 'completed',
          description: `Daily profit from ${investment.plan_name}`,
        });

        processed++;
        console.log(`✅ Credited ${dailyProfit} ${investment.currency} to ${investment.wallet_address}`);

      } catch (error: any) {
        console.error(`Error processing investment ${investment.id}:`, error);
        failed++;
      }
    }

    // Complete matured investments (unlock principal)
    const { data: maturedInvestments } = await supabase
      .from('investments')
      .select('*')
      .eq('status', 'completed')
      .is('end_date', null);

    let maturedProcessed = 0;

    if (maturedInvestments && maturedInvestments.length > 0) {
      for (const investment of maturedInvestments) {
        try {
          // Get platform balance
          const { data: platformBalance } = await supabase
            .from('platform_balances')
            .select('*')
            .eq('wallet_address', investment.wallet_address)
            .single();

          if (!platformBalance) continue;

          // Unlock principal to available balance
          const balanceField = `${investment.currency.toLowerCase()}_balance`;
          const lockedField = `${investment.currency.toLowerCase()}_locked`;

          const currentBalance = platformBalance[balanceField] || 0;
          const currentLocked = platformBalance[lockedField] || 0;

          const newBalance = currentBalance + investment.amount;
          const newLocked = Math.max(0, currentLocked - investment.amount);

          const { error: unlockError } = await supabase
            .from('platform_balances')
            .update({
              [balanceField]: newBalance,
              [lockedField]: newLocked,
              last_updated: new Date().toISOString(),
            })
            .eq('wallet_address', investment.wallet_address);

          if (unlockError) {
            console.error(`Failed to unlock principal:`, unlockError);
            continue;
          }

          // Mark as fully processed
          await supabase
            .from('investments')
            .update({ end_date: new Date().toISOString() })
            .eq('id', investment.id);

          // Create refund transaction
          await supabase.from('transactions').insert({
            user_id: investment.user_id,
            wallet_address: investment.wallet_address,
            type: 'refund',
            amount: investment.amount,
            currency: investment.currency,
            status: 'completed',
            description: `Principal returned from completed ${investment.plan_name}`,
          });

          maturedProcessed++;
        } catch (error: any) {
          console.error(`Error processing matured investment:`, error);
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
    console.error('Cron job error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
