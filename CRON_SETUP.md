# Automated Profit Crediting System

This document explains how the automated profit crediting system works and how to set it up.

## How It Works

The system automatically:
1. **Credits daily profits** to users with active investments
2. **Unlocks principal** when investments reach maturity
3. **Updates investment status** from active to completed
4. **Creates transaction records** for all profit and principal returns

## Components

### 1. Profit Cron Service (`src/services/profitCron.ts`)

Main functions:
- `processDailyProfits()` - Credits daily profit to all active investments
- `completeMaturedInvestments()` - Unlocks principal for completed investments
- `runProfitCron()` - Main function that runs both processes

### 2. Platform Balance Service (`src/services/platformBalance.ts`)

Helper functions used by cron:
- `creditDailyProfit()` - Adds profit to available balance
- `unlockFundsFromInvestment()` - Returns principal to available balance

## Setup Options

### Option 1: Manual Execution (Testing)

You can manually trigger the cron job from the browser console:

```typescript
// In browser console
import { runProfitCron } from './services/profitCron';
await runProfitCron();
```

### Option 2: Backend Cron Job (Production)

For production, you should set up a backend service with a cron scheduler:

#### Using Node.js with node-cron:

1. Create a backend server file `server/cron.js`:

```javascript
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Import your cron functions
const { runProfitCron } = require('../src/services/profitCron');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily profit cron...');
  await runProfitCron();
});

console.log('Cron job scheduled');
```

2. Run the server:
```bash
node server/cron.js
```

### Option 3: Supabase Edge Functions (Recommended)

Deploy as a Supabase Edge Function that runs on a schedule:

1. Create `supabase/functions/daily-profit/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify this is called from Supabase scheduler
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Run profit crediting logic here
  // ... (copy logic from profitCron.ts)

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

2. Deploy the function:
```bash
supabase functions deploy daily-profit
```

3. Schedule it in Supabase Dashboard:
- Go to Database → Cron Jobs
- Create new job: `0 0 * * *` (daily at midnight)
- Call: `daily-profit` edge function

### Option 4: Vercel Cron Jobs

If deploying to Vercel, create `api/cron/daily-profit.ts`:

```typescript
import { runProfitCron } from '../../src/services/profitCron';

export default async function handler(req: any, res: any) {
  // Verify request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await runProfitCron();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Then add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-profit",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Common schedules:
- `0 0 * * *` - Daily at midnight
- `0 */6 * * *` - Every 6 hours
- `*/30 * * * *` - Every 30 minutes
- `0 12 * * *` - Daily at noon

## Testing

To test the cron job manually:

1. Create a test investment in the database
2. Run the cron function manually:

```typescript
import { runProfitCron, processInvestmentProfit } from './services/profitCron';

// Test single investment
const testInvestment = {
  id: 'test-id',
  amount: 1000,
  daily_return: 1.5,
  currency: 'USDC',
  // ... other fields
};

await processInvestmentProfit(testInvestment);

// Or test all investments
await runProfitCron();
```

## Monitoring

Add monitoring to track cron job execution:

1. Log results to a monitoring service
2. Set up alerts for failures
3. Track metrics:
   - Number of investments processed
   - Total profit credited
   - Number of completed investments
   - Execution time

## Security

- Keep cron endpoints secured with authentication
- Use service role key (not anon key) for Supabase
- Validate request origin
- Rate limit the endpoint
- Log all executions for audit trail

## Next Steps

1. Choose deployment option based on your infrastructure
2. Set up monitoring and alerts
3. Test thoroughly in development
4. Deploy to production
5. Monitor first few executions closely
