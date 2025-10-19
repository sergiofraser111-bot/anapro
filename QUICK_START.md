# Quick Start Guide - Automated Profit System

## 🚀 What You Have Now

✅ Complete platform balance tracking system
✅ Automated daily profit crediting
✅ Vercel Cron Job ready to deploy
✅ Admin testing interface

## 📋 Quick Setup Checklist

### 1️⃣ Database Setup (5 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy contents of `supabase-schema-clean.sql`
3. Paste and click **Run**
4. Verify tables created (should see success message)

### 2️⃣ Get Your Credentials (2 minutes)

You need 3 things:

**A. Supabase URL**
- Already in your `.env`: `VITE_SUPABASE_URL`

**B. Supabase Service Role Key** (NEW - not the anon key!)
- Supabase Dashboard → Settings → API
- Scroll to "Project API keys"
- Copy **`service_role`** key
- Save it somewhere safe

**C. Cron Secret** (NEW - make one up)
- Any random string works
- Example: `my-super-secret-cron-key-12345`
- Or generate: https://www.uuidgenerator.net/

### 3️⃣ Deploy to Vercel (10 minutes)

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Before deploying, add Environment Variables:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Service role key from step 2B
   - `CRON_SECRET` = Your secret from step 2C
5. Click "Deploy"
6. Wait for deployment to complete

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service_role key

vercel env add CRON_SECRET
# Paste your cron secret

# Deploy
vercel --prod
```

### 4️⃣ Verify Cron Job (2 minutes)

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Cron Jobs**
3. You should see:
   - Path: `/api/cron/daily-profit`
   - Schedule: `0 0 * * *`
   - Status: ✅ Active

### 5️⃣ Test Everything (5 minutes)

**Manual Test via Admin Page:**
```
1. Navigate to: https://your-app.vercel.app/admin/cron
2. Click "Run Full Cron"
3. Should see results showing investments processed
```

**Or test the API directly:**
```bash
curl -X GET https://your-app.vercel.app/api/cron/daily-profit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🎯 How It Works

### User Flow
```
1. User deposits SOL/USDC/USDT
   → Platform balance credited automatically

2. User creates investment
   → Funds locked from available balance

3. Every day at midnight UTC
   → Cron job runs
   → Calculates daily profit (amount × daily_return%)
   → Credits profit to available balance
   → User can withdraw profits anytime

4. When investment matures
   → Principal unlocked to available balance
   → Investment marked as completed
```

### Example
```
Investment: 1000 USDC in Growth Plan
Daily Return: 2% = 20 USDC
Duration: 45 days

Day 1: +20 USDC → Available Balance
Day 2: +20 USDC → Available Balance
...
Day 45: +20 USDC + 1000 USDC principal unlocked

Total Profit: 900 USDC (90%)
```

## 📊 Monitoring

### Check Cron Execution
1. Vercel Dashboard → Functions
2. Find `daily-profit` function
3. View logs and execution history

### Check Database
Run in Supabase SQL Editor:

```sql
-- Recent profit transactions
SELECT * FROM transactions
WHERE type = 'profit'
ORDER BY created_at DESC
LIMIT 10;

-- Active investments status
SELECT
  plan_name,
  amount,
  currency,
  profit_earned,
  last_profit_date,
  status
FROM investments
WHERE status = 'active';
```

## 🔧 Common Tasks

### Change Cron Schedule

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-profit",
      "schedule": "0 12 * * *"  // Daily at noon instead of midnight
    }
  ]
}
```

Then redeploy: `vercel --prod`

### Manually Trigger Cron

While developing:
```
http://localhost:5173/admin/cron
```

In production:
```bash
curl -X GET https://your-app.vercel.app/api/cron/daily-profit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📝 Files You Need to Know

| File | Purpose |
|------|---------|
| `api/cron/daily-profit.ts` | Cron job endpoint |
| `vercel.json` | Vercel configuration |
| `src/services/profitCron.ts` | Profit calculation logic |
| `src/services/platformBalance.ts` | Balance management |
| `src/pages/AdminCron.tsx` | Admin testing page |

## 🆘 Troubleshooting

### "Unauthorized" Error
- Check CRON_SECRET is correct in Vercel env vars
- Verify Authorization header: `Bearer YOUR_SECRET`

### No Profits Credited
- Check if investments exist and are active
- Verify `last_profit_date` is not today
- Check function logs in Vercel Dashboard

### Cron Not Running
- Verify it's deployed to production (`vercel --prod`)
- Check Cron Jobs page in Vercel Dashboard
- Some Vercel plans may have restrictions

## 📚 Documentation

- **Full Implementation**: See `IMPLEMENTATION_COMPLETE.md`
- **Vercel Setup**: See `VERCEL_CRON_SETUP.md`
- **Alternative Options**: See `CRON_SETUP.md`

## ✅ Success Checklist

- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] Deployed to Vercel
- [ ] Cron job active in Vercel Dashboard
- [ ] Tested via `/admin/cron`
- [ ] Verified profit transactions in database

## 🎉 You're Done!

Your platform will now automatically:
- Credit daily profits to users
- Unlock principal at maturity
- Create transaction records
- Handle multiple currencies

**Next**: Create a test investment and watch it earn profits!

---

**Need Help?**
- Check logs in Vercel Dashboard → Functions
- Run queries in Supabase SQL Editor
- Test manually at `/admin/cron`
