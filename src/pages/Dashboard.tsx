import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  TrendingUp,
  User,
  Menu,
  X,
  LogOut,
  Wallet as WalletIcon,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { getAllBalances, getBalancesInUSD } from '../services/solana';
import type { TokenBalance } from '../services/solana';
import { getTotalBalance } from '../services/platformBalance';
import { getUserInvestments } from '../services/api';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey, disconnect, connected } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [balances, setBalances] = useState<TokenBalance>({ sol: 0, usdc: 0, usdt: 0 });
  const [totalUSD, setTotalUSD] = useState<number>(0);
  const [platformBalance, setPlatformBalance] = useState<any>(null);
  const [activeInvestmentsCount, setActiveInvestmentsCount] = useState<number>(0);
  const [activeInvestmentsValue, setActiveInvestmentsValue] = useState<number>(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Pull-to-refresh on mobile
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await fetchBalances();
    },
    enabled: true
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!connected || !publicKey) {
      navigate('/');
      return;
    }

    // Load user data
    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      // If no profile data, redirect to complete profile
      navigate('/complete-profile');
    }
  }, [connected, publicKey, navigate]);

  // Fetch balances when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    }
  }, [connected, publicKey]);

  const fetchBalances = async () => {
    if (!publicKey) return;

    setIsLoadingBalances(true);
    try {
      const walletAddress = publicKey.toString();

      // Fetch wallet balances (SOL, USDC, USDT) from blockchain
      const tokenBalances = await getAllBalances(walletAddress);
      setBalances(tokenBalances);

      // Fetch total USD value
      const usdValue = await getBalancesInUSD(walletAddress);
      setTotalUSD(usdValue);

      // Fetch platform balance (deposited funds)
      const platformBal = await getTotalBalance(walletAddress);
      setPlatformBalance(platformBal);

      // Fetch user investments
      const { data: investmentsData } = await getUserInvestments(walletAddress);
      if (investmentsData) {

        // Calculate active investments count and total value
        const activeInvestments = investmentsData.filter(inv => inv.status === 'active');
        setActiveInvestmentsCount(activeInvestments.length);

        // Calculate total value of active investments
        const totalValue = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        setActiveInvestmentsValue(totalValue);
      } else {
        setActiveInvestmentsCount(0);
        setActiveInvestmentsValue(0);
      }
    } catch (error) {
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('profitAnalysisUser');
    navigate('/');
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
    { icon: CreditCard, label: 'Buy Crypto', path: '/dashboard/buy-crypto' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Pull-to-Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center bg-slate-900/90 text-white"
          style={{ height: `${Math.min(pullDistance, 80)}px` }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

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
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300 overflow-y-auto scrollbar-transparent ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Balance Cards */}
          <div className="p-4 border-b border-slate-200 space-y-4 flex-shrink-0">
            {/* Wallet Balance */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-600 font-semibold">Wallet Balance</div>
                <button
                  onClick={fetchBalances}
                  disabled={isLoadingBalances}
                  className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                  title="Refresh balances"
                >
                  <RefreshCw className={`w-3 h-3 text-slate-500 ${isLoadingBalances ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-lg font-bold text-slate-900 mb-2">
                {isLoadingBalances ? (
                  <span className="text-slate-400">Loading...</span>
                ) : (
                  <>${totalUSD.toFixed(2)}</>
                )}
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>{balances.sol.toFixed(4)} SOL</div>
                <div>{balances.usdc.toFixed(2)} USDC</div>
                <div>{balances.usdt.toFixed(2)} USDT</div>
              </div>
            </div>

            {/* Platform Balance */}
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-700 font-semibold mb-2">Platform Balance</div>
              {isLoadingBalances ? (
                <div className="text-sm text-green-600">Loading...</div>
              ) : platformBalance ? (
                <>
                  <div className="text-xs text-green-700 space-y-0.5 mb-2">
                    <div className="flex justify-between">
                      <span>Available:</span>
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <div>{platformBalance.sol.available.toFixed(4)} SOL</div>
                      <div>{platformBalance.usdc.available.toFixed(2)} USDC</div>
                      <div>{platformBalance.usdt.available.toFixed(2)} USDT</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Locked in Investments:</span>
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <div>{platformBalance.sol.locked.toFixed(4)} SOL</div>
                      <div>{platformBalance.usdc.locked.toFixed(2)} USDC</div>
                      <div>{platformBalance.usdt.locked.toFixed(2)} USDT</div>
                    </div>
                  </div>
                  {platformBalance.totalProfit > 0 && (
                    <div className="text-xs text-green-700 mt-2 pt-2 border-t border-green-200">
                      <div className="font-semibold">Total Profit Earned:</div>
                      <div className="text-sm font-bold">${platformBalance.totalProfit.toFixed(2)}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-green-600">No deposits yet</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
              >
                DEPOSIT
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
              >
                WITHDRAW
              </button>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-4 flex-grow">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path
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

          {/* Additional */}
          <div className="p-4 border-t border-slate-200 flex-shrink-0">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {userData.displayName}!
            </h1>
            <p className="text-slate-600">Here's what's happening with your investments today.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Wallet Balance</span>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {isLoadingBalances ? (
                  <span className="text-slate-400">Loading...</span>
                ) : (
                  `$${totalUSD.toFixed(2)}`
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {balances.sol.toFixed(4)} SOL • {balances.usdc.toFixed(2)} USDC • {balances.usdt.toFixed(2)} USDT
              </div>
            </motion.div>

            {/* Platform Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Platform Balance</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              {isLoadingBalances ? (
                <div className="text-2xl font-bold text-slate-400">Loading...</div>
              ) : platformBalance ? (
                <>
                  <div className="text-2xl font-bold text-slate-900">
                    ${((platformBalance.sol.available + platformBalance.sol.locked) * 150 +
                      (platformBalance.usdc.available + platformBalance.usdc.locked) +
                      (platformBalance.usdt.available + platformBalance.usdt.locked)).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {(platformBalance.sol.available + platformBalance.sol.locked).toFixed(4)} SOL • {(platformBalance.usdc.available + platformBalance.usdc.locked).toFixed(2)} USDC • {(platformBalance.usdt.available + platformBalance.usdt.locked).toFixed(2)} USDT
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900">$0.00</div>
                  <div className="text-xs text-slate-600 mt-1">No deposits yet</div>
                </>
              )}
            </motion.div>

            {/* Active Investments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Active Investments</span>
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              {isLoadingBalances ? (
                <div className="text-2xl font-bold text-slate-400">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900">
                    {activeInvestmentsCount}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {activeInvestmentsCount > 0
                      ? `$${activeInvestmentsValue.toFixed(2)} invested`
                      : 'No active plans'}
                  </div>
                </>
              )}
            </motion.div>

            {/* Total Profit Earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Profit Earned</span>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              {isLoadingBalances ? (
                <div className="text-2xl font-bold text-slate-400">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    ${platformBalance?.totalProfit?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {activeInvestmentsCount > 0
                      ? `From ${activeInvestmentsCount} investment${activeInvestmentsCount !== 1 ? 's' : ''}`
                      : 'No earnings yet'}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* CTA Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Buy Crypto CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-2">Have No Funds?</h3>
              <p className="text-blue-100 text-sm mb-4">Buy your crypto assets here quickly and securely with MoonPay</p>
              <Link
                to="/dashboard/buy-crypto"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 font-semibold rounded-lg transition-colors text-sm"
              >
                Buy Crypto Now
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>

            {/* Investment Journey CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-2">Start Your Investment Journey</h2>
              <p className="text-slate-300 mb-6">Choose from our investment plans and start growing your portfolio today.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard/plans"
                  className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  View Investment Plans
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
                >
                  Deposit Funds
                  <ArrowDownLeft className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={() => {
          // Refresh balances after successful deposit
          fetchBalances();
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {
          // Refresh balances after successful withdrawal
          fetchBalances();
        }}
      />
    </div>
  );
}
