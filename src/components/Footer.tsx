import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-400/20" />
      </div>

      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <div className="flex items-center space-x-3 group">
              <motion.img
                src="/logo.jpg"
                alt="Profit Analysis"
                className="w-12 h-12 rounded-xl shadow-lg transition-transform duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
              />
              <span className="text-xl font-bold group-hover:text-accent-400 transition-colors">
                Profit Analysis
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Leading the way in online trading, bringing the opportunities of financial markets to global audiences.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-5 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/why', label: 'Why Profit Analysis' },
                { to: '/contact', label: 'Contact' },
              ].map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={link.to}
                    className="text-slate-400 hover:text-accent-400 transition-colors inline-flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-accent-400 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Regulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-5 text-white">Regulation</h3>
            <ul className="space-y-3 text-slate-400">
              {[
                'Authorised across multiple jurisdictions',
                'FCA Registration: 800467',
                'FSC License: C116472235',
                'Member of Financial Commission',
              ].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="flex items-start"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-2 mr-2.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-5 text-white">Contact Us</h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: 'Burton Joyce, Nottingham, UK' },
                { icon: Phone, text: '+447375257887' },
                { icon: Mail, text: 'support@profitanalysis.com' },
              ].map((contact, index) => (
                <motion.li
                  key={contact.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="flex items-start space-x-3 text-slate-400 group hover:text-slate-300 transition-colors"
                >
                  <contact.icon className="w-5 h-5 text-accent-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-relaxed">{contact.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar with Premium Styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-slate-800/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-400">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm"
            >
              © 2017 - 2025{' '}
              <span className="text-white font-semibold">Profit Analysis</span>. All rights reserved.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xs max-w-2xl text-center leading-relaxed"
            >
              <span className="text-accent-400 font-semibold">Risk Warning:</span>{' '}
              Trading involves significant risk. Past performance is no guarantee of future results.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
