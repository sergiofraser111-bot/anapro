# Vercel Deployment Guide

This guide will help you deploy the Profit Analysis platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account with this repository
3. Supabase project set up
4. Solana RPC endpoint (optional, but recommended)

## Step 1: Prepare Your Repository

Make sure all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `profit-analysis` repository
4. Vercel will auto-detect the framework as **Vite**

## Step 3: Configure Build Settings

Vercel should auto-detect these settings from `vercel.json`:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 4: Set Environment Variables

Click on "Environment Variables" and add the following:

### Required Variables:

1. **VITE_SUPABASE_URL**
   - Value: Your Supabase project URL (from Supabase dashboard)
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Get from: Supabase Dashboard > Settings > API

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (for backend cron jobs)
   - Get from: Supabase Dashboard > Settings > API
   - ⚠️ **IMPORTANT**: Mark this as **SECRET** (not exposed to browser)

4. **CRON_SECRET**
   - Value: Generate a random secret string
   - Example: Use `openssl rand -hex 32` to generate
   - Purpose: Protect your cron endpoints

### Optional Variables:

5. **VITE_SOLANA_NETWORK**
   - Value: `mainnet-beta` or `devnet`
   - Default: `mainnet-beta`

6. **VITE_SOLANA_RPC_URL**
   - Value: Your Helius or custom RPC endpoint
   - Example: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Get free key at: https://www.helius.dev/

7. **VITE_APP_NAME**
   - Value: `Profit Analysis`

8. **VITE_APP_URL**
   - Value: Your Vercel deployment URL
   - Example: `https://profit-analysis.vercel.app`
   - Note: Update this after first deployment

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-project.vercel.app`

## Step 6: Post-Deployment Configuration

### Update App URL
1. Go to your Vercel project settings
2. Update `VITE_APP_URL` environment variable with your actual deployment URL
3. Redeploy to apply changes

### Configure Custom Domain (Optional)
1. Go to your Vercel project > Settings > Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### Set Up Cron Jobs
Your daily profit calculation cron is already configured in `vercel.json`:
- Path: `/api/cron/daily-profit`
- Schedule: Daily at midnight (UTC)

## Step 7: Verify Deployment

Visit your deployment URL and test:
- ✅ Homepage loads correctly
- ✅ Wallet connection works
- ✅ User signup and profile creation
- ✅ Dashboard displays balances
- ✅ Deposit/Withdraw functionality
- ✅ PWA install prompt appears on mobile

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Environment Variables Not Working
- Make sure variable names start with `VITE_` for client-side access
- Redeploy after changing environment variables
- Check browser console for errors

### Wallet Connection Issues
- Verify Solana RPC URL is correct
- Check network setting (mainnet-beta vs devnet)
- Test with multiple wallets (Phantom, Solflare)

### Database Connection Errors
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Review Supabase logs for errors

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically:
1. Pull latest changes
2. Run build
3. Deploy to production

## Performance Monitoring

- View deployment analytics in Vercel dashboard
- Monitor Core Web Vitals
- Check function logs for cron jobs
- Review error tracking

## Security Checklist

- ✅ Environment variables properly configured
- ✅ Service role key marked as secret
- ✅ Cron secret in place
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Security headers configured in vercel.json

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Solana Documentation: https://docs.solana.com

---

**Ready to deploy?** Follow the steps above and your application will be live!
