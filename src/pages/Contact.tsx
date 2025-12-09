import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';

export default function Contact() {

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      {/* Hero */}
      <section className="relative py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"
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
            className="max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Get in <span className="text-gradient-gold">Touch</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                  Contact Information
                </h2>
              </motion.div>

              {/* WhatsApp Contact Card */}
              <motion.a
                href="https://wa.me/447375257887"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative elevated-card p-8 group overflow-hidden cursor-pointer border-2 border-success-500 hover:border-success-600 transition-colors">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-success-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <MessageCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          Chat on WhatsApp
                        </h3>
                        <p className="text-slate-600">Get instant support via WhatsApp</p>
                      </div>
                    </div>
                    <motion.div
                      className="text-success-600 group-hover:translate-x-2 transition-transform"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.a>

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: 'Address', detail: 'Burton Joyce, Nottingham, UK', color: 'primary', link: null },
                  { icon: Phone, title: 'Phone', detail: '+447375257887', color: 'accent', link: 'tel:+447375257887' },
                  { icon: Mail, title: 'Email', detail: 'support@profitanalysis.com', color: 'primary', link: 'mailto:support@profitanalysis.com' },
                ].map((contact, index) => {
                  const Icon = contact.icon;
                  const CardContent = (
                    <>
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                            contact.color === 'primary' ? 'from-primary-500 to-primary-600' : 'from-accent-400 to-accent-500'
                          } flex items-center justify-center flex-shrink-0 shadow-lg`}
                          whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-2 text-lg">{contact.title}</h3>
                          <p className="text-slate-600">{contact.detail}</p>
                        </div>
                      </div>
                    </>
                  );

                  return contact.link ? (
                    <motion.a
                      key={contact.title}
                      href={contact.link}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: -5 }}
                      className="elevated-card p-6 group block cursor-pointer"
                    >
                      {CardContent}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={contact.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: -5 }}
                      className="elevated-card p-6 group"
                    >
                      {CardContent}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                className="glass-card p-8 border-2 border-accent-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-md"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </motion.div>
                  Business Hours
                </h3>
                <div className="space-y-3 text-slate-700">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM (GMT)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 4:00 PM (GMT)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Sunday</span>
                    <span className="text-error-600">Closed</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />

        <div className="container-custom relative z-10">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Start{' '}
              <span className="text-gradient-gold">Trading?</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful traders and start your journey with Profit Analysis today.
            </p>
            <Link to="/signup">
              <motion.button
                className="btn-accent inline-flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
