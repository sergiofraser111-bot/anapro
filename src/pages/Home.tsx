import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import {
  Users,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Globe,
  Zap,
  Clock
} from 'lucide-react';
import { getTop3Traders, getLastUpdateTime, type Trader } from '../utils/traders';
import LivePriceTicker from '../components/LivePriceTicker';
import { type ReactNode } from 'react';

interface PricingPlan {
  name: string;
  subtitle: string;
  priceRange: string | ReactNode;
  weekly: string;
  trades: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter Plan',
    subtitle: 'STOCKS',
    priceRange: '$1,000 - $1,500',
    weekly: '1.5%',
    trades: '30 days',
  },
  {
    name: 'Growth Plan',
    subtitle: 'STOCKS',
    priceRange: '$2,000 - $4,500',
    weekly: '2.0%',
    trades: '45 days',
    popular: true,
  },
  {
    name: 'Professional Plan',
    subtitle: 'STOCKS',
    priceRange: '$5,000 - $15,000',
    weekly: '2.5%',
    trades: '60 days',
  },
  {
    name: 'Elite Plan',
    subtitle: 'STOCKS',
    priceRange: '$20,000+',
    weekly: '3.0%',
    trades: '90 days',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Update traders every hour
  useEffect(() => {
    const updateTraders = () => {
      setTopTraders(getTop3Traders());
      setLastUpdate(getLastUpdateTime());
    };

    // Initial update
    updateTraders();

    // Update every hour
    const interval = setInterval(updateTraders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInvestNow = () => {
    // Check if wallet is connected
    if (!connected || !publicKey) {
      // Not connected - send to signup page
      navigate('/signup');
      return;
    }

    // Check if user has completed profile
    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        const walletAddress = publicKey.toString();

        // Check if wallet matches and profile is complete
        if (userData.walletAddress === walletAddress && userData.profileComplete === true) {
          // User is logged in with complete profile - go to investments
          navigate('/dashboard/investments');
          return;
        }
      } catch (e) {
      }
    }

    // Profile not complete or not found - go to complete profile
    navigate('/complete-profile', {
      state: { walletAddress: publicKey.toString() }
    });
  };

  const handleStartFollowing = () => {
    // Same authentication flow as invest - goes to investments page
    if (!connected || !publicKey) {
      navigate('/signup');
      return;
    }

    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        const walletAddress = publicKey.toString();

        if (userData.walletAddress === walletAddress && userData.profileComplete === true) {
          // User is logged in - go to investments page
          navigate('/dashboard/investments');
          return;
        }
      } catch (e) {
      }
    }

    navigate('/complete-profile', {
      state: { walletAddress: publicKey.toString() }
    });
  };

  const handleGetFullList = () => {
    // For "Get Full List" button - goes to traders page
    if (!connected || !publicKey) {
      navigate('/signup');
      return;
    }

    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        const walletAddress = publicKey.toString();

        if (userData.walletAddress === walletAddress && userData.profileComplete === true) {
          // User is logged in - go to traders page to see full list
          navigate('/traders');
          return;
        }
      } catch (e) {
      }
    }

    navigate('/complete-profile', {
      state: { walletAddress: publicKey.toString() }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden hero-gradient">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Need help to{' '}
                <span className="text-gradient-gold">start trading?</span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                The Perfect Financial Solution For You. Our superb financial technologies make all the difference in connecting you to financial organizations, capital specialists, and investors.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link to="/signup" className="btn-accent inline-flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="btn-secondary inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          className="container-custom relative z-10 mt-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass-card-dark p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">10K+</div>
                <div className="text-sm text-slate-400">Strategy Managers</div>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">180+</div>
                <div className="text-sm text-slate-400">Countries</div>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">11</div>
                <div className="text-sm text-slate-400">Awards</div>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">8 Years</div>
                <div className="text-sm text-slate-400">Experience</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Price Ticker */}
      <LivePriceTicker />

      {/* Investment Plans */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Choose Your Investment Plan
            </h2>
            <p className="text-xl text-slate-600">
              Follow. Save. Grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div
                  className={`h-full elevated-card p-6 relative overflow-hidden ${plan.popular ? 'ring-2 ring-accent-400' : ''
                    }`}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <motion.span
                        className="bg-gradient-to-r from-accent-400 to-accent-500 text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-md"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        Popular
                      </motion.span>
                    </div>
                  )}

                  <div className="relative z-10">
                    {plan.subtitle && (
                      <div className="text-xs font-bold text-primary-600 mb-2 tracking-wider">
                        {plan.subtitle}
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-900 mb-6">{plan.name}</h3>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold text-slate-900">{plan.priceRange}</span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">Investment Range</div>
                      <div className="inline-block px-3 py-1 bg-success-50 text-success-700 rounded-full text-xs font-semibold">
                        {plan.weekly} daily returns
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-start text-sm text-slate-700">
                        <CheckCircle className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{plan.weekly} weekly guaranteed returns</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-700">
                        <CheckCircle className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{plan.trades} investment period</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-700">
                        <CheckCircle className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span>100% capital return guarantee</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-700">
                        <CheckCircle className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span>Managed by PWA professionals</span>
                      </div>
                    </div>

                    <button
                      onClick={handleInvestNow}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group/btn ${plan.popular
                        ? 'btn-primary'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                    >
                      Invest Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Traders */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              PWA
            </h2>
            <p className="text-lg text-slate-600 mb-2">Follow. Save. Grow.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Last Update: {lastUpdate || 'Loading...'}</span>
            </div>
          </motion.div>

          <motion.h3
            className="text-2xl font-bold text-center text-slate-900 mb-12 mt-8 tracking-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            TOP STRATEGY MANAGERS
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {topTraders.map((trader, index) => (
              <motion.div
                key={trader.username}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="h-full elevated-card p-6 relative overflow-hidden">
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 text-center">
                    <motion.div
                      className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-slate-100 group-hover:border-accent-400 transition-colors shadow-md"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={trader.image}
                        alt={trader.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{trader.name}</h4>
                    <p className="text-sm text-slate-500 mb-6">{trader.username}</p>

                    <div className="space-y-3 mb-6 text-left bg-slate-50 rounded-xl p-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Gain</span>
                        <span className="text-lg font-bold text-success-600">{trader.gain}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Managed</span>
                        <span className="text-base font-bold text-slate-900">{trader.funds}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-600">Trades</span>
                        <span className="text-sm font-semibold text-slate-900">{trader.trades}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStartFollowing}
                      className="w-full btn-primary group/btn"
                    >
                      Start Following
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            className="max-w-4xl mx-auto mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Find the suitable traders to follow
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Choose experienced traders, follow them, and sit back while they do all the work. Your investment portfolio will grow with every successful trade, while you save your time and effort.
            </p>
            <button
              onClick={handleGetFullList}
              className="btn-accent inline-flex items-center justify-center"
            >
              Get Full List
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>

          <p className="text-center text-sm text-slate-500 mt-10">
            Past performance does not guarantee future results
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Benefits of Trading with Us
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience premium trading with cutting-edge technology and unmatched support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Accounts for Everyone',
                description: 'Suited to all kinds of traders, from beginners to professionals.',
                color: 'primary',
              },
              {
                icon: Zap,
                title: 'Low Trading Costs',
                description: 'Superfast trade execution - check our performance scorecard.',
                color: 'accent',
              },
              {
                icon: Smartphone,
                title: "World's Most Popular Platform",
                description: 'Choose MT4 or MT5 on mobile, desktop or web.',
                color: 'primary',
              },
              {
                icon: Globe,
                title: 'Copy Trading Programme',
                description: 'Discover traders to copy with our innovative copy trading programme.',
                color: 'accent',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group text-center"
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.color === 'primary'
                      ? 'from-primary-500 to-primary-600'
                      : 'from-accent-400 to-accent-500'
                      } flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    <Icon className="w-9 h-9 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="container-custom">
          <p className="text-center text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
            {/* BBC */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/bbc.png" alt="BBC" className="h-10 object-contain" />
            </div>

            {/* Bloomberg */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/bloomberg.png" alt="Bloomberg" className="h-8 object-contain" />
            </div>

            {/* CNBC */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/cnbc.png" alt="CNBC" className="h-8 object-contain" />
            </div>

            {/* Financial Times */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/financial-times.png" alt="Financial Times" className="h-10 object-contain" />
            </div>

            {/* MarketWatch */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/marketwatch.png" alt="MarketWatch" className="h-7 object-contain" />
            </div>

            {/* Reuters */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/reuters.png" alt="Reuters" className="h-8 object-contain" />
            </div>

            {/* WSJ */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="/logos/wsj.png" alt="The Wall Street Journal" className="h-9 object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
