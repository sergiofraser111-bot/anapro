import { motion } from 'framer-motion';
import {
  DollarSign,
  Smartphone,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Headphones,
  Lock,
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Financial Instruments',
    description: 'Trade a wide range of financial instruments including currency pairs, CFDs, precious metals and commodities.',
  },
  {
    icon: Smartphone,
    title: 'Trading Account Types',
    description: 'Instant execution with our popular Advantage, Micro and Advantage Plus accounts. No hidden commissions.',
  },
  {
    icon: Globe,
    title: 'World\'s Most Popular Platform',
    description: 'Access MetaTrader 4, MetaTrader 5, Mobile and tablet apps, and WebTrader.',
  },
  {
    icon: BarChart3,
    title: 'Trading Tools and Signals',
    description: 'Get access to trading signals on MT4 / MT5 and Acuity tool to track sentiment.',
  },
];

const features = [
  { icon: DollarSign, title: 'Low Trading Costs', description: 'Competitive spreads and transparent pricing with no hidden fees.' },
  { icon: Zap, title: 'Superfast Execution', description: 'Lightning-fast order execution with minimal latency.' },
  { icon: Shield, title: 'Regulated and Secure', description: 'Authorised and regulated in multiple jurisdictions.' },
  { icon: Headphones, title: '24/7 Support', description: 'Dedicated multilingual customer support team.' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Professional charting tools and real-time market analysis.' },
  { icon: Lock, title: 'Segregated Funds', description: 'Client funds segregated in tier-1 banks.' },
];

export default function Why() {
  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      {/* Hero with Animated Gradient */}
      <section className="relative py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Why <span className="text-gradient-gold">Profit Analysis?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-slate-200 leading-relaxed"
            >
              Over 10,000 active traders worldwide have chosen a global leader in online financial trading & investment. Here's why.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Benefits */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Discover <span className="text-gradient">Better Trading</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Profit Analysis is an award-winning broker for a reason. Wherever your financial interests lie, you can rely on us to provide trading solutions to suit you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 group"
              >
                <div className="flex space-x-5">
                  <div className="flex-shrink-0">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <benefit.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Benefits of Choosing <span className="text-gradient-gold">Profit Analysis</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="elevated-card p-7 group relative overflow-hidden"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center mb-5 shadow-lg"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-accent-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Copy Trading */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-10 lg:p-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Copy Trading with <span className="text-gradient-gold">Profit Analysis Invest</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Want to start trading but not sure how? Discover and copy thousands of experienced traders with Trading Market Analysis.
              </p>
              <ul className="space-y-5">
                {[
                  'Daily market analysis from our global research team',
                  'Range of tools and widgets to identify signals',
                  'Expert analysis with Profit Analysis Trading Signals',
                  'Currency converter and trader\'s calculators',
                  'Core values of trust and commitment'
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-4 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex-shrink-0"
                    >
                      <CheckCircle className="w-7 h-7 text-success-600 mt-0.5" />
                    </motion.div>
                    <span className="text-slate-700 text-lg leading-relaxed group-hover:text-slate-900 transition-colors">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats with Enhanced Design */}
      <section className="relative py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'People worldwide have chosen Profit Analysis' },
              { value: '11', label: 'Industry awards for superior quality' },
              { value: 'Superb', label: 'Industry reputation and trust' },
              { value: 'Trust', label: 'Core values of trust and commitment' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card-dark p-8 text-center group"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="text-5xl lg:text-6xl font-bold text-gradient-gold mb-4"
                >
                  {stat.value}
                </motion.div>
                <div className="text-slate-200 leading-relaxed group-hover:text-white transition-colors">
                  {stat.label}
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-400/0 to-primary-500/0 group-hover:from-accent-400/10 group-hover:to-primary-500/10 transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
