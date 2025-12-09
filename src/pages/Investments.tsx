import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  TrendingUp,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Receipt,
  User,
  Wallet as WalletIcon,
  Clock,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  LineChart,
} from 'lucide-react';
import { getUserInvestments, updateInvestment } from '../services/api';

interface Investment {
  id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  daily_return: number;
  duration_days: number;
  expected_return: number;
  profit_earned?: number;
  created_at: string;
}

export default function Investments() {
  const navigate = useNavigate();
  const { publicKey, disconnect, connected } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  useEffect(() => {
    if (connected && publicKey) {
      fetchInvestments();
    }
  }, [connected, publicKey]);

  const fetchInvestments = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const { data } = await getUserInvestments(publicKey.toString());
      if (data) {
        // Map backend dates to strings for local state
        const mappedInvestments: Investment[] = data.map((inv: any) => ({
          ...inv,
          start_date: new Date(inv.start_date).toISOString(),
          end_date: inv.end_date ? new Date(inv.end_date).toISOString() : undefined,
          created_at: new Date(inv.created_at).toISOString()
        }));
        setInvestments(mappedInvestments);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('profitAnalysisUser');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const calculateDaysRemaining = (startDate: string, durationDays: number) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const calculateProgress = (startDate: string, durationDays: number) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    const totalTime = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
  };

  const calculateCurrentEarnings = (
    amount: number,
    dailyReturn: number,
    startDate: string,
    status: string
  ) => {
    if (status === 'cancelled') return 0;

    const start = new Date(startDate);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dailyReturnAmount = (amount * dailyReturn) / 100;
    return Math.max(0, daysElapsed * dailyReturnAmount);
  };

  const handleCancelInvestment = async (investmentId: string) => {
    if (!confirm('Are you sure you want to cancel this investment? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await updateInvestment(investmentId, { status: 'cancelled' });
      if (error) {
        throw new Error(error);
      }
      alert('Investment cancelled successfully');
      fetchInvestments();
      setShowDetailModal(false);
    } catch (error: any) {
      alert('Failed to cancel investment: ' + error.message);
    }
  };

  const openDetailModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailModal(true);
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

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const totalInvested = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + calculateCurrentEarnings(inv.amount, inv.daily_return, inv.start_date, inv.status), 0);
  const dailyEarnings = activeInvestments.reduce(
    (sum, inv) => sum + (inv.amount * inv.daily_return) / 100,
    0
  );

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
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${item.path === '/dashboard/investments'
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Investments</h1>
            <p className="text-slate-600">Track and manage your active investments</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500">Active Investments</div>
                <BarChart3 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{activeInvestments.length}</div>
              <div className="text-xs text-slate-500 mt-1">
                {investments.filter(inv => inv.status === 'completed').length} completed
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500">Total Invested</div>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">${totalInvested.toFixed(2)}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Capital deployed
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500">Total Earnings</div>
                <LineChart className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(2) : 0}% ROI
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500">Daily Earnings</div>
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600">${dailyEarnings.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-1">Per day average</div>
            </motion.div>
          </div>

          {/* Investments Grid */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading investments...</p>
            </motion.div>
          ) : investments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center"
            >
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments yet</h3>
              <p className="text-slate-600 mb-6">Start your investment journey today</p>
              <Link
                to="/dashboard/plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
              >
                View Investment Plans
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {investments.map((investment, index) => {
                const daysRemaining = calculateDaysRemaining(
                  investment.start_date,
                  investment.duration_days
                );
                const progress = calculateProgress(
                  investment.start_date,
                  investment.duration_days
                );
                const currentEarnings = calculateCurrentEarnings(
                  investment.amount,
                  investment.daily_return,
                  investment.start_date,
                  investment.status
                );

                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {investment.plan_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              investment.status
                            )}`}
                          >
                            {getStatusIcon(investment.status)}
                            <span className="ml-1">{investment.status}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Investment</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${investment.amount}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {investment.status === 'active' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Daily Return</div>
                        <div className="text-lg font-bold text-green-600">
                          {investment.daily_return}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Current Earnings</div>
                        <div className="text-lg font-bold text-green-600">
                          ${currentEarnings.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Duration</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {investment.duration_days} days
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          {investment.status === 'active' ? 'Days Remaining' : 'Status'}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {investment.status === 'active'
                            ? `${daysRemaining} days`
                            : investment.status}
                        </div>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Calendar className="w-3 h-3" />
                      Started {new Date(investment.start_date).toLocaleDateString()}
                    </div>

                    {/* Expected Return */}
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Expected Total Return</span>
                        <span className="text-sm font-bold text-slate-900">
                          ${investment.expected_return.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-600">Total at Maturity</span>
                        <span className="text-sm font-bold text-green-600">
                          ${(investment.amount + investment.expected_return).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailModal(investment)}
                        className="flex-1 px-4 py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
                      >
                        View Details
                      </button>
                      {investment.status === 'active' && (
                        <button
                          onClick={() => handleCancelInvestment(investment.id)}
                          className="px-4 py-2 border-2 border-red-200 hover:border-red-300 text-red-600 rounded-lg font-semibold transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Investment Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDetailModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Investment Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Plan Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedInvestment.plan_name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                    selectedInvestment.status
                  )}`}
                >
                  {selectedInvestment.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Investment Amount</div>
                  <div className="text-xl font-bold text-slate-900">
                    ${selectedInvestment.amount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Currency</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedInvestment.currency}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Daily Return Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedInvestment.daily_return}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  ${((selectedInvestment.amount * selectedInvestment.daily_return) / 100).toFixed(2)} per day
                </div>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Current Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  $
                  {calculateCurrentEarnings(
                    selectedInvestment.amount,
                    selectedInvestment.daily_return,
                    selectedInvestment.start_date,
                    selectedInvestment.status
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Accumulated so far</div>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Expected Return</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${selectedInvestment.expected_return.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">At maturity</div>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Total Value</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${(selectedInvestment.amount + selectedInvestment.expected_return).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Capital + Returns</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Investment Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Investment Started</div>
                    <div className="text-xs text-slate-500">
                      {new Date(selectedInvestment.start_date).toLocaleDateString()} at{' '}
                      {new Date(selectedInvestment.start_date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {selectedInvestment.status === 'active' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">In Progress</div>
                      <div className="text-xs text-slate-500">
                        {calculateDaysRemaining(
                          selectedInvestment.start_date,
                          selectedInvestment.duration_days
                        )}{' '}
                        days remaining
                      </div>
                    </div>
                  </div>
                )}

                {selectedInvestment.end_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Expected Maturity</div>
                      <div className="text-xs text-slate-500">
                        {new Date(selectedInvestment.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Investment Information</p>
                  <p className="text-xs">
                    Your investment is earning daily returns at a rate of{' '}
                    {selectedInvestment.daily_return}%. Returns are automatically calculated and
                    added to your account. You can withdraw your funds at any time, subject to the
                    platform's terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedInvestment.status === 'active' && (
              <button
                onClick={() => handleCancelInvestment(selectedInvestment.id)}
                className="w-full px-6 py-3 border-2 border-red-200 hover:border-red-300 text-red-600 rounded-lg font-semibold transition-colors"
              >
                Cancel Investment
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
