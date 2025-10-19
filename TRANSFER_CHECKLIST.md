# Transfer Checklist - Deploying to Another Person's GitHub

Follow this checklist to successfully transfer this project to another GitHub account.

## ✅ Pre-Transfer Checklist

### 1. Repository Preparation
- [ ] Ensure all code is committed and working
- [ ] Remove any personal API keys or credentials
- [ ] Verify `.env` file is in `.gitignore`
- [ ] Test the application locally (`npm run dev`)
- [ ] Run build to ensure no errors (`npm run build`)

### 2. Documentation Check
- [ ] README.md is complete and accurate
- [ ] DEPLOYMENT_GUIDE.md is available
- [ ] .env.example has all required variables
- [ ] supabase-schema-clean.sql is present

### 3. Code Cleanup
- [ ] Remove any commented-out code
- [ ] Remove debug console.logs
- [ ] Ensure no hardcoded credentials in code
- [ ] Check for any personal information in code

## 🚀 Transfer Process

### Option A: Using the Deployment Script (Easiest)

```bash
# Run the deployment script
bash deploy-to-github.sh

# Follow the prompts:
# 1. Create new repo on GitHub
# 2. Enter the repository URL
# 3. Script will handle the rest
```

### Option B: Manual Transfer

#### Step 1: Create New GitHub Repository

1. Log into the **new GitHub account**
2. Go to https://github.com/new
3. Fill in repository details:
   - **Name:** `profit-analysis` (or preferred name)
   - **Description:** "Solana-based investment platform with automated profit distribution"
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

#### Step 2: Remove Existing Git History (if needed)

```bash
# Navigate to project directory
cd profit-analysis

# Remove existing git configuration
rm -rf .git
```

#### Step 3: Initialize New Repository

```bash
# Initialize new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Profit Analysis Platform"
```

#### Step 4: Push to New GitHub Repository

```bash
# Add new remote (replace with actual URL)
git remote add origin https://github.com/NEW_USERNAME/profit-analysis.git

# Push to main branch
git branch -M main
git push -u origin main
```

## 📋 Post-Transfer Setup for New Owner

### Immediate Setup (Required)

#### 1. Clone the Repository
```bash
git clone https://github.com/NEW_USERNAME/profit-analysis.git
cd profit-analysis
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Set Up Supabase

**Create Supabase Project:**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter details:
   - Name: `profit-analysis`
   - Database Password: (create strong password)
   - Region: (select closest to users)
4. Wait for project creation (2-3 minutes)

**Set Up Database:**
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy entire contents of `supabase-schema-clean.sql`
4. Paste and click **"Run"**
5. Verify success: "Success. No rows returned"

**Get Credentials:**
1. Go to **Settings** → **API**
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - anon public key (long string starting with `eyJ...`)

#### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

Update with your values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SOLANA_NETWORK=devnet  # Use devnet for testing
VITE_APP_NAME=Profit Analysis
VITE_APP_URL=http://localhost:5173
```

#### 5. Test Locally

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Test all features:
# - Wallet connection
# - Profile creation
# - Deposits/withdrawals
# - Investments
```

### Production Deployment (Optional)

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - Go to Settings → Environment Variables
# - Add all variables from .env file

# Deploy to production
vercel --prod
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
```

## 🔒 Security Checklist

- [ ] `.env` file is NOT committed to repository
- [ ] `.env` is in `.gitignore`
- [ ] No API keys or credentials in code
- [ ] Supabase Row Level Security is enabled
- [ ] Using HTTPS in production
- [ ] Environment variables set in deployment platform

## 📝 Files to Review

### Essential Files
- `README.md` - Project overview and quick start
- `DEPLOYMENT_GUIDE.md` - Detailed setup instructions
- `.env.example` - Environment variable template
- `supabase-schema-clean.sql` - Database schema
- `package.json` - Dependencies and scripts

### Important Directories
- `src/` - Source code
- `public/` - Static assets (logo, etc.)
- `api/` - Serverless API endpoints

## 🆘 Common Issues

### Issue: "Cannot find module '@solana/wallet-adapter-react'"
**Solution:** Run `npm install`

### Issue: "Supabase connection failed"
**Solution:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is not paused
- Ensure database schema was run successfully

### Issue: "Wallet connection error"
**Solution:**
- Install a Solana wallet extension (Phantom recommended)
- Refresh the page
- Check browser console for specific errors

### Issue: "Build fails in production"
**Solution:**
- Run `npm run build` locally first
- Fix any TypeScript errors
- Ensure all environment variables are set in deployment platform

## 📞 Support Resources

- **README.md** - Quick start guide
- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment instructions
- **Supabase Docs** - https://supabase.com/docs
- **Solana Docs** - https://docs.solana.com
- **Vercel Docs** - https://vercel.com/docs
- **Netlify Docs** - https://docs.netlify.com

## ✅ Final Verification

After transfer, verify:

- [ ] Repository is accessible at new GitHub URL
- [ ] All files are present (check against this checklist)
- [ ] Documentation files are readable
- [ ] `.env` file is NOT in repository
- [ ] Project runs locally with `npm run dev`
- [ ] Database schema runs successfully in Supabase
- [ ] All features work (wallet, deposits, investments)

## 🎉 Success Criteria

Transfer is successful when:

1. ✅ Code is in new GitHub repository
2. ✅ New owner can clone and install dependencies
3. ✅ Supabase database is set up correctly
4. ✅ Application runs locally without errors
5. ✅ All features work (wallet connection, deposits, investments)
6. ✅ (Optional) Production deployment is live and functional

---

**Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions!**
