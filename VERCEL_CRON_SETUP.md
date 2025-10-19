# Vercel Cron Jobs Setup Guide

This guide will help you set up automated daily profit crediting using Vercel Cron Jobs.

## What We've Created

✅ **Vercel Cron Endpoint**: `api/cron/daily-profit.ts`
✅ **Vercel Configuration**: `vercel.json`

## Setup Steps

### 1. Get Your Supabase Service Role Key

**IMPORTANT:** You need the **Service Role Key**, not the Anon Key.

1. Go to your Supabase Dashboard
2. Select your project
3. Click **Settings** (gear icon)
4. Click **API** in the sidebar
5. Scroll down to **Project API keys**
6. Copy the **`service_role`** key (NOT the anon key)
   - It starts with `eyJhbGc...`
   - Keep this secret! Never commit to git

### 2. Generate a Cron Secret

Generate a random secret for securing your cron endpoint:

```bash
# On Windows (PowerShell):
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString()))

# Or use this online: https://www.uuidgenerator.net/
# Just generate a UUID and use it as your secret
```

Example: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

### 3. Add Environment Variables to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add these three variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL (e.g., `https://xxxxx.supabase.co`) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key from Step 1 | Production |
| `CRON_SECRET` | Your generated secret from Step 2 | Production |

**IMPORTANT:** Make sure to add them to **Production** environment.

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service_role key when prompted

vercel env add CRON_SECRET
# Paste your cron secret when prompted
```

### 4. Deploy to Vercel

#### First Time Deployment

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Subsequent Deployments

```bash
# Just push to your git repository
git add .
git commit -m "Add cron job"
git push

# Vercel will auto-deploy if connected to git
```

Or manually:

```bash
vercel --prod
```

### 5. Verify Cron Job is Configured

After deployment:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Cron Jobs**
3. You should see:
   - **Path**: `/api/cron/daily-profit`
   - **Schedule**: `0 0 * * *` (daily at midnight UTC)
   - **Status**: Active

### 6. Test the Cron Endpoint

You can manually trigger the cron job to test it:

```bash
# Replace with your actual values
curl -X GET https://your-project.vercel.app/api/cron/daily-profit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use a tool like Postman:
- **URL**: `https://your-project.vercel.app/api/cron/daily-profit`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer YOUR_CRON_SECRET`

Expected response:
```json
{
  "success": true,
  "profits": {
    "total": 5,
    "processed": 5,
    "skipped": 0,
    "failed": 0,
    "completed": 1
  },
  "maturity": {
    "processed": 0
  },
  "timestamp": "2025-01-17T00:00:00.000Z"
}
```

### 7. Monitor Cron Execution

#### View Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions**
3. Find `daily-profit` function
4. Click to view execution logs

#### Check in Supabase

Run this query in Supabase SQL Editor to see recent profit transactions:

```sql
-- View recent profit transactions
SELECT
  t.created_at,
  t.wallet_address,
  t.amount,
  t.currency,
  t.description
FROM transactions t
WHERE t.type = 'profit'
ORDER BY t.created_at DESC
LIMIT 20;

-- Check last profit date for each investment
SELECT
  plan_name,
  amount,
  currency,
  profit_earned,
  last_profit_date,
  status
FROM investments
WHERE status = 'active'
ORDER BY last_profit_date DESC;
```

## Cron Schedule Explained

Current schedule: `0 0 * * *`

```
┌─────────── minute (0)
│ ┌───────── hour (0 = midnight)
│ │ ┌─────── day of month (*)
│ │ │ ┌───── month (*)
│ │ │ │ ┌─── day of week (*)
│ │ │ │ │
0 0 * * *
```

**Runs**: Every day at 00:00 UTC (midnight)

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-profit",
      "schedule": "0 12 * * *"  // Daily at noon UTC
    }
  ]
}
```

Common schedules:
- `0 0 * * *` - Daily at midnight
- `0 12 * * *` - Daily at noon
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight

## Troubleshooting

### Issue: "Unauthorized" error

**Cause**: CRON_SECRET doesn't match or is missing

**Fix**:
1. Verify environment variable in Vercel Dashboard
2. Check Authorization header format: `Bearer YOUR_SECRET`
3. Redeploy after updating env vars

### Issue: "SUPABASE_SERVICE_ROLE_KEY is undefined"

**Cause**: Service role key not set or not in production environment

**Fix**:
1. Add SUPABASE_SERVICE_ROLE_KEY in Vercel Dashboard
2. Make sure it's set for **Production** environment
3. Redeploy

### Issue: No investments processed

**Cause**: No active investments or already processed today

**Fix**:
1. Check if you have active investments in database
2. Verify `last_profit_date` is not today
3. Check function logs for errors

### Issue: Cron not running automatically

**Cause**: Vercel cron jobs only work on production deployments

**Fix**:
1. Make sure you deployed to production (`vercel --prod`)
2. Verify cron configuration in Vercel Dashboard
3. Check if project is on a paid Vercel plan (some features require it)

## Security Best Practices

✅ **DO:**
- Use Service Role Key (has full database access)
- Keep CRON_SECRET secure
- Store secrets in Vercel environment variables
- Monitor cron execution logs
- Set up error alerting

❌ **DON'T:**
- Commit secrets to git
- Use Anon Key for cron jobs
- Expose cron endpoint publicly
- Skip authorization checks

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test cron endpoint manually
4. ✅ Wait for first automatic execution (midnight UTC)
5. ✅ Check Supabase for profit transactions
6. ✅ Monitor logs for errors

## Alternative: Manual Testing

While developing, you can still use the admin page:

```
http://localhost:5173/admin/cron
```

This calls the same logic but doesn't require Vercel deployment.

## Support

- Vercel Cron Docs: https://vercel.com/docs/cron-jobs
- Vercel CLI Docs: https://vercel.com/docs/cli
- Function Logs: Vercel Dashboard → Functions

---

**Last Updated**: January 2025
**Status**: Production Ready
