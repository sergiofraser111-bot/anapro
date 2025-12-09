import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, TrendingUp, Users as UsersIcon, DollarSign } from 'lucide-react';
import { getHourlyTraders, getLastUpdateTime, type Trader } from '../utils/traders';

export default function Traders() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const [allTraders, setAllTraders] = useState<Trader[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const updateLeaderboard = () => {
      setAllTraders(getHourlyTraders());
      setLastUpdate(getLastUpdateTime());
    };

    // Update immediately
    updateLeaderboard();

    // Update every hour
    const interval = setInterval(updateLeaderboard, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const handleStartFollowing = () => {
    // Check if wallet is connected
    if (!connected || !publicKey) {
      navigate('/signup');
      return;
    }

    // Check if user has completed profile
    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        const walletAddress = publicKey.toString();

        if (userData.walletAddress === walletAddress && userData.profileComplete === true) {
          // User is logged in with complete profile - go to investments page
          navigate('/dashboard/investments');
          return;
        }
      } catch (e) {
      }
    }

    // Profile not complete - redirect to complete profile
    navigate('/complete-profile', {
      state: { walletAddress: publicKey.toString() }
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      {/* Header Section */}
      <section className="relative py-20 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-gradient-gold">Strategy</span> Managers
            </motion.h1>
            <motion.p
              className="text-xl text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Choose the Strategy Manager that's suitable for you based on how much capital you're willing to invest and risk.
              To help you decide, please check out our list of Strategy Managers to get more insights into their performance and other trading characteristics.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {[
              { icon: UsersIcon, value: '20+', label: 'Strategy Managers' },
              { icon: DollarSign, value: '$14M+', label: 'Total Managed Funds' },
              { icon: TrendingUp, value: '850+', label: 'Total Trades' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card-dark p-6 text-center group"
                >
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Icon className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                  </motion.div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-300">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Last Update */}
      <section className="py-6 bg-white border-b border-slate-200">
        <div className="container-custom text-center">
          <p className="text-sm text-slate-500">
            Last Update: {lastUpdate || 'Loading...'}
          </p>
        </div>
      </section>

      {/* Traders List */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">TOP STRATEGY MANAGERS</h2>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-500 uppercase tracking-wider px-6">
              <div className="flex-1">Trader</div>
              <div className="w-32 text-right hidden sm:block">Gain</div>
              <div className="w-32 text-right">Managed Funds</div>
              <div className="w-40"></div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {allTraders.map((trader, index) => (
              <motion.div
                key={trader.username}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                whileHover={{ x: 5 }}
                className="elevated-card p-6 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-2xl font-bold text-gradient w-10 text-center">{index + 1}</div>
                    <motion.div
                      className="w-14 h-14 rounded-full overflow-hidden border-3 border-slate-200 group-hover:border-accent-400 transition-colors flex-shrink-0 shadow-md"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={trader.image}
                        alt={trader.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate text-lg">{trader.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{trader.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right w-32 hidden sm:block">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gain</div>
                      <div className="text-lg font-bold text-success-600">{trader.gain}</div>
                    </div>
                    <div className="text-right w-32">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Managed</div>
                      <div className="text-base font-bold text-slate-900">{trader.funds}</div>
                      <div className="text-xs text-slate-500 mt-1">{trader.trades}</div>
                    </div>
                    <button
                      onClick={handleStartFollowing}
                      className="btn-primary group/btn whitespace-nowrap"
                    >
                      Start Following
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Find the suitable traders to{' '}
              <span className="text-gradient">follow</span>
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Choose experienced traders, follow them, and sit back while they do all the work.
              Your investment portfolio will grow with every successful trade, while you save your time and effort.
            </p>
            <motion.button
              onClick={handleStartFollowing}
              className="btn-accent inline-flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Following
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-sm text-slate-500 mt-8">
              Past performance does not guarantee future results
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
