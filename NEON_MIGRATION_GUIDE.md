# Neon Migration - Implementation Guide

## ⚠️ CRITICAL: You Must Complete These Steps

This codebase has been migrated from Supabase to Neon PostgreSQL with comprehensive security fixes. **The application will NOT work until you complete the setup below.**

---

## Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb`)

---

## Step 2: Run Database Schema

1. Open the Neon SQL Editor in your project dashboard
2. Copy the entire contents of `neon-schema.sql`
3. Paste and execute in the SQL Editor
4. Verify all tables were created successfully

---

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Neon Database
DATABASE_URL=postgresql://your-connection-string-here

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Cron Secret (for API endpoints)
CRON_SECRET=your-cron-secret-key

# CoinGecko API Key
VITE_COINGECKO_API_KEY=your-coingecko-api-key

# Solana
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# App
VITE_APP_NAME=Profit Analysis Platform
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

**IMPORTANT:** Never commit `.env` to Git!

---

## Step 4: Install Dependencies

The required packages should already be installing. If not, run:

```bash
npm install @neondatabase/serverless jsonwebtoken tweetnacl bs58 express helmet cors express-rate-limit dotenv
npm install --save-dev @types/jsonwebtoken @types/express @types/cors
```

---

## Step 5: Remove Old Supabase Code

The following files are NO LONGER USED and can be deleted:

- `src/lib/supabase.ts` (replaced by `src/lib/database.ts`)
- `supabase-schema.sql` (replaced by `neon-schema.sql`)
- `supabase-schema-clean.sql` (replaced by `neon-schema.sql`)

---

## Step 6: Update Frontend Authentication

The authentication flow has changed. Users now need to:

1. Connect wallet
2. Sign a message to prove ownership
3. Receive a JWT session token
4. Use token for all API requests

**TODO:** Update `src/pages/Signup.tsx` and `src/pages/CompleteProfile.tsx` to use the new auth flow from `src/lib/auth.ts`

---

## Step 7: Test the Application

```bash
npm run dev
```

Visit `http://localhost:5173` and test:

1. Wallet connection
2. Profile creation
3. Balance operations
4. Investment creation

---

## What Was Fixed

### Security Issues Resolved ✅

1. **Database Access Control** - Removed permissive RLS policies, now using proper authentication
2. **Authentication System** - Implemented JWT with wallet signature verification
3. **Race Conditions** - All balance operations now use atomic database functions
4. **Input Validation** - Added database constraints and validation
5. **API Key Exposure** - Moved to environment variables
6. **Audit Logging** - Added comprehensive audit trail
7. **Session Management** - Proper session tracking and expiry

### New Features ✅

1. **Atomic Operations** - `credit_balance()`, `debit_balance()`, `lock_funds()`, `unlock_funds()`
2. **Session Management** - JWT-based authentication with expiry
3. **Audit Trail** - All database operations logged
4. **Type Safety** - Full TypeScript types for database operations
5. **Error Handling** - Comprehensive error messages

---

## Database Functions Available

```sql
-- Credit balance atomically
SELECT credit_balance('wallet_address', 10.5, 'SOL');

-- Debit balance with insufficient funds check
SELECT debit_balance('wallet_address', 5.0, 'SOL');

-- Lock funds for investment
SELECT lock_funds('wallet_address', 100.0, 'USDC');

-- Unlock funds from investment
SELECT unlock_funds('wallet_address', 100.0, 'USDC');
```

---

## API Endpoints (To Be Implemented)

The following API endpoints need to be created:

- `POST /api/auth/challenge` - Get auth challenge
- `POST /api/auth/login` - Login with signature
- `POST /api/auth/logout` - Logout
- `GET /api/balance` - Get platform balance
- `POST /api/deposit` - Process deposit
- `POST /api/withdraw` - Process withdrawal
- `POST /api/invest` - Create investment
- `GET /api/investments` - Get user investments
- `GET /api/transactions` - Get user transactions

---

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong JWT_SECRET (32+ random characters)
3. Enable SSL for database connection
4. Set up monitoring (Sentry recommended)
5. Configure rate limiting
6. Set up cron job for daily profit processing

---

## Support

If you encounter issues:

1. Check database connection string
2. Verify all environment variables are set
3. Check browser console for errors
4. Verify database schema was created successfully

---

## Migration Checklist

- [ ] Created Neon database
- [ ] Ran `neon-schema.sql`
- [ ] Created `.env` file with all variables
- [ ] Installed dependencies
- [ ] Removed old Supabase files
- [ ] Updated frontend auth flow
- [ ] Tested wallet connection
- [ ] Tested profile creation
- [ ] Tested balance operations
- [ ] Ready for production
