import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  ShoppingCart,
  CreditCard,
  Shield,
  Zap,
  CheckCircle,
  Info,
  ExternalLink,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  User,
  Wallet as WalletIcon,
} from 'lucide-react';

type CryptoType = 'SOL' | 'USDC' | 'USDT';

export default function BuyCrypto() {
  const navigate = useNavigate();
  const { publicKey, disconnect, connected } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('SOL');
  const [amount, setAmount] = useState('100');

  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/signup');
      return;
    }

    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/complete-profile');
    }
  }, [connected, publicKey, navigate]);

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('profitAnalysisUser');
    navigate('/');
  };

  const cryptoOptions = [
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: '/tokens/solana.jpeg',
      color: 'purple',
      moonpayCode: 'sol',
      description: 'Fast and low-cost blockchain',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '/tokens/usdc.png',
      color: 'blue',
      moonpayCode: 'usdc_sol',
      description: 'Stable coin pegged to USD',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: '/tokens/usdt.png',
      color: 'green',
      moonpayCode: 'usdt_sol',
      description: 'Popular stable coin',
    },
  ];

  const handleBuyNow = () => {
    if (!publicKey || !amount) return;

    const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);
    if (!selectedCryptoData) return;

    // MoonPay URL construction - No API key required!
    // This is the public-facing MoonPay widget that works without authentication
    const moonpayUrl = new URL('https://buy.moonpay.com');

    // Add parameters for the purchase
    moonpayUrl.searchParams.append('currencyCode', selectedCryptoData.moonpayCode);
    moonpayUrl.searchParams.append('walletAddress', publicKey.toString());
    moonpayUrl.searchParams.append('baseCurrencyAmount', amount);
    moonpayUrl.searchParams.append('baseCurrencyCode', 'usd');
    moonpayUrl.searchParams.append('colorCode', '%231e293b'); // Brand color (URL encoded)
    moonpayUrl.searchParams.append('language', 'en');

    // Open MoonPay in new window
    window.open(moonpayUrl.toString(), '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
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
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Buy Crypto</h1>
                <p className="text-slate-600">Purchase crypto assets instantly with MoonPay</p>
              </div>
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-6"
          >
            {/* Crypto Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                Select Cryptocurrency
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto.symbol as CryptoType)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCrypto === crypto.symbol
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 flex-shrink-0">
                        <img src={crypto.icon} alt={crypto.symbol} className="w-full h-full object-contain rounded-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{crypto.symbol}</div>
                        <div className="text-xs text-slate-500">{crypto.name}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{crypto.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full pl-8 pr-4 py-4 border-2 border-slate-200 rounded-xl text-lg font-semibold focus:border-blue-600 focus:outline-none"
                  min="30"
                  step="10"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Minimum purchase: $30 USD
              </p>
            </div>

            {/* Destination Wallet */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Destination Wallet
              </label>
              <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <WalletIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600">Connected Wallet</span>
                </div>
                <p className="text-sm font-mono text-slate-900 break-all">
                  {publicKey?.toString()}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Crypto will be sent directly to your connected wallet
              </p>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyNow}
              disabled={!amount || parseFloat(amount) < 30}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Buy {selectedCrypto} with MoonPay
            </button>

            {/* Info Notice */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <p className="mb-2">
                  Clicking the button will open MoonPay in a new window. Complete your purchase there,
                  and the crypto will be sent directly to your wallet address shown above.
                </p>
                <p className="text-xs">
                  <strong>No account needed!</strong> MoonPay's public widget works without registration.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Secure & Safe</h3>
              <p className="text-sm text-slate-600">
                MoonPay is a trusted payment processor with bank-level security
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Fast Delivery</h3>
              <p className="text-sm text-slate-600">
                Receive your crypto within minutes of payment confirmation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">No Account Needed</h3>
              <p className="text-sm text-slate-600">
                Simple checkout with credit card, debit card, or bank transfer - no sign-up required!
              </p>
            </motion.div>
          </div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6"
          >
            <h3 className="font-bold text-slate-900 mb-3">Accepted Payment Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Credit Card</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Debit Card</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <WalletIcon className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Bank Transfer</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Apple/Google Pay</span>
              </div>
            </div>
          </motion.div>

          {/* MoonPay Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-100 border-2 border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-2">Powered by MoonPay</p>
                <p className="mb-2">
                  This service is provided by MoonPay, a third-party payment processor.
                  By using this service, you agree to MoonPay's terms and conditions.
                </p>
                <a
                  href="https://www.moonpay.com/terms_of_use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  View MoonPay Terms
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
