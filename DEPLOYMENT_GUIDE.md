# Profit Analysis - Deployment Guide

A comprehensive guide to deploy this Solana-based investment platform to a new GitHub repository and get it running.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Fork/Clone to New Repository](#step-1-forkclone-to-new-repository)
- [Step 2: Supabase Database Setup](#step-2-supabase-database-setup)
- [Step 3: Environment Configuration](#step-3-environment-configuration)
- [Step 4: Install Dependencies](#step-4-install-dependencies)
- [Step 5: Run the Project](#step-5-run-the-project)
- [Step 6: Deploy to Production](#step-6-deploy-to-production)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm**
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** (free) - [Sign up here](https://supabase.com/)
- **Solana Wallet** (Phantom, Solflare, etc.) - [Get Phantom](https://phantom.app/)

---

## Step 1: Fork/Clone to New Repository

### Option A: Create a New Repository (Recommended)

1. **Create a new repository on GitHub:**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository (e.g., `profit-analysis-platform`)
   - **Do NOT** initialize with README, .gitignore, or license

2. **Remove existing git history and push to new repo:**
   ```bash
   # Navigate to the project directory
   cd profit-analysis

   # Remove existing git configuration
   rm -rf .git

   # Initialize new git repository
   git init

   # Add all files
   git add .

   # Create initial commit
   git commit -m "Initial commit: Profit Analysis Platform"

   # Add your new GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option B: Fork the Repository

If you have access to the original repository:
```bash
# Fork the repository on GitHub using the "Fork" button
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/profit-analysis-platform.git
cd profit-analysis-platform
```

---

## Step 2: Supabase Database Setup

### 2.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** `profit-analysis` (or any name you prefer)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Select closest to your users
4. Click **"Create new project"** and wait for setup to complete (2-3 minutes)

### 2.2 Run Database Schema

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema-clean.sql` from this repository
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: ✅ **"Success. No rows returned"** with notices about table creation

This creates all necessary tables:
- `user_profiles` - User account information
- `transactions` - All financial transactions
- `investments` - Investment plans and tracking
- `platform_balances` - User balances on the platform

### 2.3 Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values (you'll need these in Step 3):
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

---

## Step 3: Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   ```bash
   # Open .env in your text editor
   nano .env  # or use any text editor
   ```

3. **Update the following values:**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Solana Configuration
   VITE_SOLANA_NETWORK=mainnet-beta
   # For testing, you can use: devnet

   # App Configuration
   VITE_APP_NAME=Profit Analysis
   VITE_APP_URL=http://localhost:5173
   ```

   **Important Notes:**
   - Replace `your-project-id.supabase.co` with your actual Supabase URL
   - Replace `your-anon-key-here` with your Supabase anon key
   - Use `devnet` for testing, `mainnet-beta` for production
   - Never commit your `.env` file to GitHub (it's in `.gitignore`)

---

## Step 4: Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

Or if you prefer pnpm:
```bash
pnpm install
```

This will install:
- React 19 with TypeScript
- Solana Web3.js & Wallet Adapter
- Supabase client
- Framer Motion (animations)
- Tailwind CSS (styling)
- And other dependencies listed in `package.json`

---

## Step 5: Run the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will start at: **http://localhost:5173**

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser to http://localhost:5173**

### First Time Setup

1. **Connect Your Wallet:**
   - Click "Launch App" on the homepage
   - Click "Connect Wallet"
   - Select your Solana wallet (Phantom recommended)
   - Approve the connection

2. **Complete Your Profile:**
   - You'll be redirected to complete your profile
   - Fill in all required information
   - Click "Complete Profile"

3. **Explore the Dashboard:**
   - View wallet and platform balances
   - Deposit funds to the platform
   - Browse investment plans
   - Make investments
   - Track transactions

---

## Step 6: Deploy to Production

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Configure Environment Variables in Vercel Dashboard:**
   - Go to your project in Vercel
   - Settings → Environment Variables
   - Add the same variables from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_SOLANA_NETWORK`
     - `VITE_APP_NAME`
     - `VITE_APP_URL` (update to your Vercel URL)

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure Environment Variables:**
   - Go to Site settings → Environment variables
   - Add all variables from `.env` file

### Option C: Deploy to Your Own Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **The `dist` folder contains your production files**

3. **Serve using any static file server:**
   ```bash
   # Example with serve
   npm install -g serve
   serve -s dist -p 3000
   ```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check if you ran the database schema in Supabase SQL Editor
- Ensure your Supabase project is active (not paused)

#### 2. "Wallet connection failed"
- Make sure you have a Solana wallet extension installed
- Try refreshing the page and reconnecting
- Check browser console for specific errors

#### 3. "Transaction failed"
- Ensure you have enough SOL for transaction fees
- If on devnet, use the [Solana Faucet](https://faucet.solana.com/) to get test SOL
- Check Solana network status

#### 4. "Build errors during deployment"
- Run `npm run build` locally first to catch errors
- Check all TypeScript errors are resolved
- Ensure all environment variables are set in deployment platform

#### 5. "Environment variables not loading"
- All env variables must start with `VITE_` to be accessible in the frontend
- Restart development server after changing `.env` file
- In production, set env variables in your hosting platform (Vercel/Netlify)

---

## Project Structure

```
profit-analysis/
├── src/
│   ├── components/          # React components
│   │   ├── DepositModal.tsx
│   │   ├── WithdrawModal.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Investments.tsx
│   │   ├── Transactions.tsx
│   │   ├── Plans.tsx
│   │   └── ...
│   ├── services/           # API and service files
│   │   ├── api.ts          # Supabase API functions
│   │   ├── solana.ts       # Solana blockchain functions
│   │   └── platformBalance.ts
│   ├── lib/                # Utility functions
│   │   └── supabase.ts     # Supabase client setup
│   └── App.tsx             # Main app component
├── public/                 # Static assets
├── api/                    # Serverless API routes
├── supabase-schema-clean.sql  # Database schema
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

---

## Features

✅ **Solana Wallet Integration**
- Connect with Phantom, Solflare, and other wallets
- Real-time wallet balance tracking (SOL, USDC, USDT)

✅ **Investment Platform**
- Multiple investment plans with daily returns
- Deposit/withdraw functionality
- Platform balance management
- Active investment tracking

✅ **User Dashboard**
- Real-time balance updates
- Transaction history
- Investment portfolio
- Profit tracking

✅ **Secure Database**
- Supabase backend
- Row-level security
- Real-time data synchronization

---

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the browser console for error messages
3. Check Supabase logs in your project dashboard
4. Verify all environment variables are set correctly

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Blockchain:** Solana Web3.js, Wallet Adapter
- **Backend:** Supabase (PostgreSQL)
- **Deployment:** Vercel/Netlify

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to GitHub
- Never share your Supabase service_role key (only use anon key in frontend)
- Always use environment variables for sensitive data
- Test thoroughly on devnet before mainnet deployment
- Implement proper wallet signature verification for sensitive operations

---

## Next Steps

After successful deployment:

1. **Set up automated profit distribution** (cron job)
2. **Configure email notifications** (Supabase + SendGrid)
3. **Add MoonPay integration** for fiat on-ramp
4. **Implement KYC verification** for compliance
5. **Add analytics** (Google Analytics, Mixpanel)
6. **Set up monitoring** (Sentry for error tracking)

---

**Happy Deploying! 🚀**
