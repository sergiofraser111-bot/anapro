import { motion } from 'framer-motion';
import { Users, Globe2, Award, TrendingUp, Shield } from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Active Traders', icon: Users },
  { value: '180+', label: 'Countries', icon: Globe2 },
  { value: '11', label: 'Awards', icon: Award },
  { value: '8 Years', label: 'Experience', icon: TrendingUp },
];

export default function About() {
  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-24 hero-gradient overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Leading the Way in{' '}
              <span className="text-gradient-gold">Online Trading</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Established in 2017, the Profit Analysis brand is a global leader in online trading, bringing the opportunities of financial markets to global audiences, wherever they are and whatever their financial ambitions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group text-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <stat.icon className="w-9 h-9 text-white" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">
              What We Do
            </h2>
            <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                As one of the successful brands operating, we are specialists in leveraged trading, giving you the potential to generate financial returns on both rising and falling prices across FX, indices, commodities and shares.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                Whether you're an experienced trader or completely new to it, we're here to help you find freedom in the financial markets.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                The group's global network of offices and regulations spans Europe, Africa, Asia and Latin America, and we have already attracted over 10,000 active traders across 180 countries.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              A Leadership Team with a{' '}
              <span className="text-gradient">Wealth of Experience</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              The leadership team behind Profit Analysis has a wealth of experience in banking, trading and financial technology and are committed to helping our clients succeed in the financial markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />

        <div className="container-custom relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: 'Our Mission',
                description: 'To democratize financial markets and empower traders worldwide with cutting-edge technology and unparalleled support.',
              },
              {
                icon: Shield,
                title: 'Security First',
                description: 'Your funds and data are protected with bank-level security, regulated operations, and segregation of client funds.',
              },
              {
                icon: Users,
                title: 'Community Focus',
                description: 'Building a global community of successful traders through education, transparency, and innovative copy trading solutions.',
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card-dark p-8 group"
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center mb-6 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regulation */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Regulated and <span className="text-gradient">Licensed</span>
            </motion.h2>

            <div className="space-y-6">
              {[
                {
                  title: 'Financial Conduct Authority (FCA)',
                  detail: 'Registration Number: 800467',
                },
                {
                  title: 'Financial Services Commission (FSC)',
                  detail: 'Investment Dealer License: C116472235',
                },
                {
                  title: 'Member of Financial Commission',
                  detail: 'An international organization engaged in resolution of disputes within the financial services industry.',
                },
              ].map((reg, index) => (
                <motion.div
                  key={reg.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="elevated-card p-6 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 text-lg">{reg.title}</h3>
                      <p className="text-slate-600">{reg.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
