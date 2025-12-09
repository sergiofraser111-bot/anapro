import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Shield, CheckCircle, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { login, isAuthenticated, isLoading, error: authError } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Manual login handler
  const handleLogin = async () => {
    if (!connected || !publicKey) return;

    setIsProcessing(true);
    try {
      const result = await login();

      if (result.success) {
        // Successfully authenticated
        navigate('/dashboard');
      } else if (result.error?.includes('User not found')) {
        // New user - redirect to complete profile
        navigate('/complete-profile', {
          state: { walletAddress: publicKey.toString() }
        });
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Wallet className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h1>
            <p className="text-slate-300">
              {isProcessing ? 'Authenticating...' : 'Sign in securely with your Solana wallet'}
            </p>
          </div>

          {/* Wallet Connect Button */}
          <div className="mb-4">
            <WalletMultiButton className="!w-full !bg-gradient-to-r !from-yellow-500 !to-yellow-600 hover:!from-yellow-600 hover:!to-yellow-700 !rounded-xl !h-14 !text-base !font-semibold !transition-all" />
          </div>

          {/* Manual Sign In Button (Only when connected but not authenticated) */}
          {connected && publicKey && !isAuthenticated && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onClick={handleLogin}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mb-8 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                'Verifying Identity...'
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify Identity & Sign In
                </>
              )}
            </motion.button>
          )}

          {/* Spacer if button not shown */}
          {(!connected || isAuthenticated) && <div className="mb-8" />}

          {/* Auth Error */}
          {authError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-200">{authError}</p>
            </div>
          )}

          {/* Loading State Information */}
          {(isLoading || isProcessing) && (
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300"></div>
                <p className="text-sm text-blue-200">
                  {isProcessing ? 'Please sign the message in your wallet...' : 'Verifying session...'}
                </p>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Secure Authentication</h3>
                <p className="text-sm text-slate-300">
                  Sign with your wallet - no passwords needed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Non-Custodial</h3>
                <p className="text-sm text-slate-300">
                  You always maintain full control of your funds
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Instant Access</h3>
                <p className="text-sm text-slate-300">
                  Start investing in seconds after connecting
                </p>
              </div>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-4">Supported Wallets</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-medium">Phantom</span>
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-medium">Solflare</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
