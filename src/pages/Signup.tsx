import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Shield, CheckCircle, Zap, ArrowLeft } from 'lucide-react';
import { getUserProfile } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [isChecking, setIsChecking] = useState(false);

  // Check if user has existing profile and redirect accordingly
  useEffect(() => {
    const checkUserProfile = async () => {
      if (connected && publicKey && !isChecking) {
        setIsChecking(true);

        const walletAddress = publicKey.toString();
        console.log('🔍 Checking profile for wallet:', walletAddress);

        // First, check localStorage for quick access
        const storedData = localStorage.getItem('profitAnalysisUser');
        console.log('📦 LocalStorage data:', storedData ? 'Found' : 'Not found');

        if (storedData) {
          try {
            const userData = JSON.parse(storedData);
            console.log('👤 User data:', userData);
            console.log('🔑 Wallet comparison:');
            console.log('  Stored:', userData.walletAddress);
            console.log('  Current:', walletAddress);
            console.log('  Match:', userData.walletAddress === walletAddress);
            console.log('  Profile Complete:', userData.profileComplete);

            // Check if this wallet address matches and profile is complete
            if (userData.walletAddress === walletAddress && userData.profileComplete === true) {
              console.log('✅ Profile complete! Redirecting to dashboard...');
              setTimeout(() => {
                navigate('/dashboard');
                setIsChecking(false);
              }, 500);
              return;
            } else {
              console.log('⚠️ Wallet mismatch or profile incomplete');
              console.log('  Condition 1 (wallet match):', userData.walletAddress === walletAddress);
              console.log('  Condition 2 (profile complete):', userData.profileComplete === true);
            }
          } catch (e) {
            console.error('❌ Error parsing localStorage:', e);
          }
        }

        setTimeout(async () => {

          // Check backend database for existing profile
          console.log('🌐 Checking backend database...');
          const { data: backendProfile, error } = await getUserProfile(walletAddress);

          if (error) {
            console.log('⚠️ Backend check error:', error);
          }

          if (backendProfile && backendProfile.profile_complete) {
            console.log('✅ Backend profile found! Syncing to localStorage...');
            // User exists in backend with complete profile - go to dashboard
            // Also sync to localStorage for offline access
            localStorage.setItem('profitAnalysisUser', JSON.stringify({
              username: backendProfile.username,
              displayName: backendProfile.display_name,
              email: backendProfile.email,
              phone: backendProfile.phone,
              dateOfBirth: backendProfile.date_of_birth,
              country: backendProfile.country,
              countryCode: backendProfile.country_code,
              walletAddress: backendProfile.wallet_address,
              profileComplete: backendProfile.profile_complete,
              createdAt: backendProfile.created_at,
            }));
            navigate('/dashboard');
          } else {
            // No profile found anywhere - new user, go to complete profile
            console.log('➡️ No profile found. Redirecting to complete profile...');
            navigate('/complete-profile', {
              state: { walletAddress }
            });
          }

          setIsChecking(false);
        }, 1500);
      }
    };

    checkUserProfile();
  }, [connected, publicKey, navigate, isChecking]);

  return (
    <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center">
      <div className="container-custom py-20">
        <div className="max-w-lg mx-auto">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border-2 border-slate-200 rounded-2xl p-10 shadow-sm"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {connected ? 'Wallet Connected!' : 'Create an Account'}
              </h1>
              <p className="text-slate-600">
                {connected
                  ? 'Redirecting to complete your profile...'
                  : 'Connect your Solana wallet to get started'}
              </p>
            </div>

            {/* Wallet Connection */}
            {!connected ? (
              <>
                <div className="flex justify-center mb-6">
                  <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800 !text-white !py-4 !px-8 !rounded-lg !font-semibold !transition-colors !text-base !w-full sm:!w-auto !text-center" />
                </div>

                <p className="text-center text-xs text-slate-500 mb-8">
                  Supports Phantom, Solflare, Backpack, and all Solana wallets
                </p>

                {/* Benefits */}
                <div className="space-y-4 bg-slate-50 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Secure & Private</h3>
                      <p className="text-xs text-slate-600">Your wallet, your control. No passwords to remember.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Instant Access</h3>
                      <p className="text-xs text-slate-600">Connect once and trade immediately with no delays.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Wallet className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Universal Support</h3>
                      <p className="text-xs text-slate-600">Works with any Solana wallet - choose your favorite.</p>
                    </div>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <span className="text-slate-900 font-semibold">
                      Just connect your wallet above to sign in
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-sm text-slate-600 mb-3">Connected Address:</p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-mono text-slate-900 break-all">
                    {publicKey?.toString()}
                  </p>
                </div>
                <div className="mt-6">
                  <div className="animate-pulse flex items-center justify-center space-x-2 text-slate-600">
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Install Wallet Notice */}
          {!connected && (
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Don't have a Solana wallet?{' '}
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold hover:text-yellow-500 transition-colors"
                >
                  Install Phantom
                </a>
                {' or '}
                <a
                  href="https://solflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold hover:text-yellow-500 transition-colors"
                >
                  Get Solflare
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
