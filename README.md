# Profit Analysis - Solana Investment Platform

A modern, secure investment platform built on Solana blockchain with real-time balance tracking, automated profit distribution, and seamless wallet integration.

![Platform Preview](https://img.shields.io/badge/Platform-Solana-blueviolet)
![Framework](https://img.shields.io/badge/Framework-React%2019-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/profit-analysis.git
cd profit-analysis

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

Visit **http://localhost:5173** to see the app running!

## Features

### Wallet Integration
- **Multi-Wallet Support:** Phantom, Solflare, Backpack, and more
- **Real-time Balance Tracking:** SOL, USDC, USDT balances
- **Secure Connection:** Non-custodial wallet integration

### Investment Platform
- **Multiple Investment Plans:** Daily returns from 1.5% to 15%
- **Flexible Deposits:** Deposit SOL, USDC, or USDT
- **Automated Profit Distribution:** Daily profit calculations
- **Platform Balance Management:** Separate platform wallet for investments

### User Dashboard
- **Comprehensive Overview:** Wallet balance, platform balance, active investments
- **Real-time Updates:** Live balance and profit tracking
- **Transaction History:** Complete audit trail of all operations
- **Investment Portfolio:** Track all active and completed investments

### Modern UI/UX
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Smooth Animations:** Framer Motion powered transitions
- **Dark Mode Ready:** Clean, professional interface
- **Accessible:** WCAG compliant design

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Solana Wallet** ([Phantom](https://phantom.app/))
- **Supabase Account** ([Sign up free](https://supabase.com/))

## Tech Stack

### Frontend
- **React 19** - Latest React with improved performance
- **TypeScript 5.9** - Type-safe development
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations

### Blockchain
- **Solana Web3.js** - Solana blockchain integration
- **Wallet Adapter** - Multi-wallet support
- **SPL Token** - Token program integration

### Backend
- **Supabase** - PostgreSQL database & real-time subscriptions
- **Row Level Security** - Secure data access

## Project Structure

```
profit-analysis/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── DepositModal.tsx  # Deposit funds modal
│   │   └── WithdrawModal.tsx # Withdraw funds modal
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Landing page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Investments.tsx  # Investment portfolio
│   │   ├── Transactions.tsx # Transaction history
│   │   ├── Plans.tsx        # Investment plans
│   │   └── Profile.tsx      # User profile
│   ├── services/            # API services
│   │   ├── api.ts           # Supabase API calls
│   │   ├── solana.ts        # Blockchain interactions
│   │   └── platformBalance.ts # Balance management
│   ├── lib/                 # Utilities
│   │   └── supabase.ts      # Supabase client
│   └── App.tsx              # Root component
├── api/                     # Serverless functions
├── public/                  # Static assets
├── supabase-schema-clean.sql # Database schema
└── DEPLOYMENT_GUIDE.md      # Detailed deployment instructions
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana Configuration
VITE_SOLANA_NETWORK=mainnet-beta  # or devnet for testing

# App Configuration
VITE_APP_NAME=Profit Analysis
VITE_APP_URL=http://localhost:5173
```

**See `.env.example` for a template.**

## Database Setup

1. Create a new project in [Supabase](https://supabase.com/)
2. Go to SQL Editor
3. Run the SQL from `supabase-schema-clean.sql`
4. Copy your project URL and anon key to `.env`

**Tables Created:**
- `user_profiles` - User accounts and KYC data
- `platform_balances` - User balances on platform
- `investments` - Investment records with daily returns
- `transactions` - Complete transaction history

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy with Netlify CLI
netlify deploy --prod --dir=dist
```

**For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Security Features

- ✅ **Non-custodial:** Users maintain full control of their wallets
- ✅ **Row Level Security:** Database-level access control
- ✅ **Environment Variables:** Sensitive data never committed
- ✅ **Transaction Signatures:** Wallet signature verification
- ✅ **HTTPS Only:** Secure communication in production

## Investment Plans

| Plan | Daily Return | Duration | Min Investment |
|------|-------------|----------|----------------|
| **Starter** | 1.5% | 30 days | $50 |
| **Basic** | 3% | 30 days | $200 |
| **Standard** | 5% | 60 days | $1,000 |
| **Professional** | 8% | 90 days | $1,000 |
| **Elite** | 12% | 120 days | $5,000 |
| **VIP** | 15% | 180 days | $10,000 |

*Returns are calculated daily and distributed automatically*

## How It Works

1. **Connect Wallet:** Connect your Solana wallet (Phantom, Solflare, etc.)
2. **Complete Profile:** Provide basic information and verify identity
3. **Deposit Funds:** Transfer SOL/USDC/USDT to your platform balance
4. **Choose Plan:** Select an investment plan that fits your goals
5. **Earn Daily:** Receive automated daily profit distributions
6. **Withdraw Anytime:** Withdraw available balance to your wallet

## Troubleshooting

### Common Issues

**Wallet won't connect:**
- Ensure you have a Solana wallet extension installed
- Try refreshing the page
- Check if wallet is unlocked

**Transaction fails:**
- Check you have enough SOL for gas fees
- Verify network connection
- Try switching RPC endpoint

**Balance not updating:**
- Click the refresh button
- Check Solana network status
- Verify transaction on explorer

**For more help, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)**

## API Endpoints

The platform includes serverless API endpoints for:

- `/api/distribute-profits` - Daily profit distribution cron
- `/api/process-matured-investments` - Handle matured investments
- `/api/update-investment-status` - Investment status updates

*Configure these in Vercel/Netlify for automated operations*

## Contributing

This is a private project. If you have access:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This platform is for educational and demonstrational purposes. Cryptocurrency investments carry risk. Users should:

- Only invest what they can afford to lose
- Understand the risks involved
- Comply with local regulations
- Do their own research (DYOR)

**This is not financial advice.**

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Check browser console for errors
4. Verify Supabase configuration

## Screenshots

*Add screenshots of your platform here*

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Referral program
- [ ] Staking integration
- [ ] DeFi strategy integrations

## Credits

Built with:
- [React](https://react.dev/)
- [Solana](https://solana.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Made for the Solana ecosystem**

**Star this repo if you find it useful!**
