import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { connected } = useWallet();

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/why', label: 'Why Profit Analysis' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img
              src="/logo.jpg"
              alt="Profit Analysis"
              className="w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-105"
              whileHover={{ rotate: 5 }}
            />
            <span className="text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-primary-600">
              Profit Analysis
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 text-sm font-semibold transition-colors group"
              >
                <span
                  className={`relative z-10 ${
                    isActive(link.path)
                      ? 'text-slate-900'
                      : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </span>
                {/* Active indicator */}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-slate-100 rounded-lg"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                {/* Hover effect */}
                {!isActive(link.path) && (
                  <div className="absolute inset-0 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {connected ? (
              <Link to="/signup" className="btn-accent">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/50">
              <div className="container-custom py-6 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive(link.path)
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Action Buttons */}
                <motion.div
                  className="pt-4 space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {connected ? (
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center btn-accent"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center px-6 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center btn-primary"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
