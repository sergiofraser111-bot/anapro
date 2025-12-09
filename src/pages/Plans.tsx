import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  TrendingUp,
  Shield,
  Zap,
  Award,
  CheckCircle,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Receipt,
  User,
  Wallet as WalletIcon,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { createInvestment, getUserProfile } from '../services/api';
import { getPlatformBalance, lockFundsForInvestment, hasSufficientBalance } from '../services/platformBalance';
import { getJupiterPrices, usdToToken, formatTokenAmount } from '../services/jupiterPrices';

interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number;
  dailyReturn: number;
  duration: number;
  totalReturn: number;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

type Currency = 'SOL' | 'USDC' | 'USDT';

const plans: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minInvestment: 1000,
    maxInvestment: 1500,
    dailyReturn: 1.5,
    duration: 30,
    totalReturn: 45,
    features: [
      'Daily returns of 1.5%',
      '30-day investment period',
      'Automatic compound option',
      'Withdraw anytime',
      'Basic analytics dashboard',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    minInvestment: 2000,
    maxInvestment: 4500,
    dailyReturn: 2.0,
    duration: 45,
    totalReturn: 90,
    features: [
      'Daily returns of 2.0%',
      '45-day investment period',
      'Priority support',
      'Advanced analytics',
      'Risk management tools',
      'Flexible withdrawal',
    ],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    minInvestment: 5000,
    maxInvestment: 15000,
    dailyReturn: 2.5,
    duration: 60,
    totalReturn: 150,
    features: [
      'Daily returns of 2.5%',
      '60-day investment period',
      'Dedicated account manager',
      'Premium analytics suite',
      'Advanced risk protection',
      'Instant withdrawals',
      'Exclusive trading signals',
    ],
    recommended: true,
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    minInvestment: 20000,
    maxInvestment: 999999,
    dailyReturn: 3.0,
    duration: 90,
    totalReturn: 270,
    features: [
      'Daily returns of 3.0%',
      '90-day investment period',
      'VIP support 24/7',
      'Custom trading strategies',
      'Maximum risk protection',
      'Priority withdrawals',
      'Private trading group access',
      'Monthly portfolio review',
    ],
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const { publicKey, disconnect, connected } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDC');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [platformBalance, setPlatformBalance] = useState<any>(null);
  const [error, setError] = useState('');
  const [tokenPrices, setTokenPrices] = useState<Map<string, number>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);

  const currencies = [
    { symbol: 'SOL', name: 'Solana', icon: '/tokens/solana.jpeg' },
    { symbol: 'USDC', name: 'USD Coin', icon: '/tokens/usdc.png' },
    { symbol: 'USDT', name: 'Tether', icon: '/tokens/usdt.png' },
  ];

  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
      return;
    }

    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/complete-profile');
    }
  }, [connected, publicKey, navigate]);

  // Fetch platform balance and token prices when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !showInvestModal) return;

      try {
        // Fetch balance
        const { data } = await getPlatformBalance(publicKey.toString());
        setPlatformBalance(data);

        // Fetch real-time prices from Jupiter
        setLoadingPrices(true);
        const prices = await getJupiterPrices();
        setTokenPrices(prices);
        setLoadingPrices(false);
      } catch (err) {
        setLoadingPrices(false);
      }
    };

    fetchData();
  }, [publicKey, showInvestModal]);

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('profitAnalysisUser');
    navigate('/');
  };

  const openInvestModal = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestmentAmount(plan.minInvestment.toString());
    setShowInvestModal(true);
    setError('');
  };

  const getAvailableBalance = () => {
    if (!platformBalance) return 0;
    const field = `${selectedCurrency.toLowerCase()}_balance` as keyof typeof platformBalance;
    return platformBalance[field] || 0;
  };

  const getCurrentPrice = (symbol: string): number => {
    return tokenPrices.get(symbol) || (symbol === 'SOL' ? 150 : 1);
  };

  const getTokenAmountForUSD = (usdAmount: number): number => {
    const price = getCurrentPrice(selectedCurrency);
    return usdToToken(usdAmount, price);
  };

  const refreshPrices = async () => {
    setLoadingPrices(true);
    try {
      const prices = await getJupiterPrices();
      setTokenPrices(prices);
    } catch (err) {
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedPlan || !publicKey) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount < selectedPlan.minInvestment || amount > selectedPlan.maxInvestment) {
      setError(`Investment amount must be between ${selectedPlan.minInvestment} and ${selectedPlan.maxInvestment}`);
      return;
    }

    // Check if user has sufficient balance
    const hasSufficient = await hasSufficientBalance(
      publicKey.toString(),
      amount,
      selectedCurrency
    );

    if (!hasSufficient) {
      setError(`Insufficient ${selectedCurrency} balance. Please deposit funds first.`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Get user profile for user_id
      const { data: profile } = await getUserProfile(publicKey.toString());
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Calculate maturity date
      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setDate(maturityDate.getDate() + selectedPlan.duration);

      // Lock funds in platform balance
      const { error: lockError } = await lockFundsForInvestment(
        publicKey.toString(),
        amount,
        selectedCurrency
      );

      if (lockError) {
        throw new Error('Failed to lock funds: ' + lockError);
      }

      // Create investment record
      const { error: investError } = await createInvestment({
        user_id: profile.id,
        wallet_address: publicKey.toString(),
        plan_name: selectedPlan.name,
        amount,
        currency: selectedCurrency,
        daily_return: selectedPlan.dailyReturn,
        duration_days: selectedPlan.duration,
        expected_return: amount * (selectedPlan.totalReturn / 100),
        start_date: startDate,
        maturity_date: maturityDate,
        status: 'active',
      });

      if (investError) {
        // If investment creation fails, we should unlock the funds
        throw new Error('Failed to create investment: ' + investError);
      }

      alert(`Investment created successfully! ${amount} ${selectedCurrency} has been locked for ${selectedPlan.duration} days.`);
      setShowInvestModal(false);
      navigate('/dashboard/investments');
    } catch (error: any) {
      setError(error.message || 'Failed to create investment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Receipt, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: TrendingUp, label: 'Investments', path: '/dashboard/investments' },
    { icon: WalletIcon, label: 'Our Plans', path: '/dashboard/plans' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.jpg" alt="Profit Analysis" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-slate-900">Profit Analysis</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500">Verified</div>
              <div className="text-sm font-semibold text-slate-900">{userData.displayName}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
              {userData.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${item.path === '/dashboard/plans'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors mb-2"
          >
            <span className="text-sm font-medium">Go to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnect Wallet</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Investment Plans</h1>
            <p className="text-slate-600">Choose the perfect plan for your investment goals</p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border-2 rounded-2xl p-6 relative ${plan.popular ? 'border-yellow-500' : plan.recommended ? 'border-slate-900' : 'border-slate-200'
                  }`}
              >
                {/* Badge */}
                {(plan.popular || plan.recommended) && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${plan.popular ? 'bg-yellow-500 text-slate-900' : 'bg-slate-900 text-white'
                    }`}>
                    {plan.popular ? 'MOST POPULAR' : 'RECOMMENDED'}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.dailyReturn}%</span>
                    <span className="text-slate-500 text-sm">daily</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Investment Range</span>
                    <span className="font-semibold text-slate-900">
                      ${plan.minInvestment.toLocaleString()} - ${plan.maxInvestment >= 100000 ? plan.maxInvestment.toLocaleString() + '+' : plan.maxInvestment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-semibold text-slate-900">{plan.duration} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Return</span>
                    <span className="font-semibold text-green-600">+{plan.totalReturn}%</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openInvestModal(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.recommended
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : plan.popular
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                >
                  Invest Now
                </button>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">Secure Investments</h3>
              <p className="text-xs text-slate-600">
                Your investments are protected with advanced security measures and blockchain technology.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">Daily Returns</h3>
              <p className="text-xs text-slate-600">
                Receive daily returns automatically to your account with real-time tracking.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">Proven Track Record</h3>
              <p className="text-xs text-slate-600">
                Join thousands of successful investors who trust our platform for consistent returns.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Investment Modal */}
      {showInvestModal && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowInvestModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Invest in {selectedPlan.name}</h2>
              <button
                onClick={() => setShowInvestModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Currency Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Select Currency
                  </label>
                  <button
                    onClick={refreshPrices}
                    disabled={loadingPrices}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingPrices ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map((currency) => {
                    const price = getCurrentPrice(currency.symbol);
                    return (
                      <button
                        key={currency.symbol}
                        onClick={() => setSelectedCurrency(currency.symbol as Currency)}
                        disabled={isProcessing}
                        className={`p-3 rounded-lg border-2 transition-all relative ${selectedCurrency === currency.symbol
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="w-8 h-8 mx-auto mb-1">
                          <img src={currency.icon} alt={currency.symbol} className="w-full h-full object-contain rounded-full" />
                        </div>
                        <div className="text-xs font-bold text-slate-900">{currency.symbol}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ${price.toFixed(currency.symbol === 'SOL' ? 2 : 4)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Balance */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Available Balance</span>
                  <span className="text-sm font-bold text-slate-900">
                    {getAvailableBalance().toFixed(6)} {selectedCurrency}
                  </span>
                </div>
              </div>

              {/* Amount Input - USD Hardcap */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Investment Amount (USD)
                </label>
                <div className="relative mb-3">
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={selectedPlan.minInvestment}
                    max={selectedPlan.maxInvestment}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 pl-8 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder={`${selectedPlan.minInvestment}`}
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    USD
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Min: ${selectedPlan.minInvestment}</span>
                  <span>Max: ${selectedPlan.maxInvestment}</span>
                </div>

                {/* Token Conversion Display */}
                {investmentAmount && parseFloat(investmentAmount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-50 border-2 border-primary-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-700 font-medium">You will invest:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-900">
                          {formatTokenAmount(getTokenAmountForUSD(parseFloat(investmentAmount)), selectedCurrency)} {selectedCurrency}
                        </div>
                        <div className="text-xs text-primary-600">
                          @ ${getCurrentPrice(selectedCurrency).toFixed(selectedCurrency === 'SOL' ? 2 : 4)} per {selectedCurrency}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Investment Summary */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Daily Return</span>
                  <span className="font-semibold text-slate-900">{selectedPlan.dailyReturn}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-900">{selectedPlan.duration} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Expected Profit (USD)</span>
                  <span className="font-semibold text-green-600">
                    ${(parseFloat(investmentAmount || '0') * (selectedPlan.totalReturn / 100)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Profit in {selectedCurrency}</span>
                  <span className="font-semibold text-green-600">
                    {formatTokenAmount(
                      getTokenAmountForUSD(parseFloat(investmentAmount || '0') * (selectedPlan.totalReturn / 100)),
                      selectedCurrency
                    )} {selectedCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-900 font-semibold">Total at Maturity</span>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      ${(parseFloat(investmentAmount || '0') * (1 + selectedPlan.totalReturn / 100)).toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-600">
                      ≈ {formatTokenAmount(
                        getTokenAmountForUSD(parseFloat(investmentAmount || '0') * (1 + selectedPlan.totalReturn / 100)),
                        selectedCurrency
                      )} {selectedCurrency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your funds will be locked in this investment for {selectedPlan.duration} days. Daily profits will be automatically credited to your available balance.
                </p>
              </div>

              <button
                onClick={handleInvest}
                disabled={isProcessing || !investmentAmount}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Confirm Investment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
