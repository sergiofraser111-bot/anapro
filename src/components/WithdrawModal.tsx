// Withdrawal Strategy Documentation
// 
// IMPORTANT: Withdrawals require actual Solana transactions to be sent from the platform wallet.
// This requires secure private key management which should NOT be in the frontend code.
//
// RECOMMENDED APPROACHES:
//
// 1. MANUAL APPROVAL (Safest - Recommended for MVP)
//    - User requests withdrawal
//    - Admin reviews and approves
//    - Admin manually sends transaction from secure wallet
//    - System marks as completed
//
// 2. HOT WALLET (Automated - Requires Infrastructure)
//    - Platform wallet private key stored in secure backend (HSM/KMS)
//    - API endpoint to process withdrawals
//    - Rate limiting and fraud detection
//    - Multi-signature for large amounts
//
// 3. MULTI-SIG (Most Secure - Complex)
//    - Requires multiple approvers
//    - Uses Solana multi-sig program
//    - Best for large amounts
//
// CURRENT IMPLEMENTATION: Manual Approval
// 
// WithdrawModal creates a withdrawal request with status 'pending'
// Admin dashboard (to be built) shows pending withdrawals
// Admin processes manually and marks as 'completed'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TokenType = 'SOL' | 'USDC' | 'USDT';

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const { publicKey, connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenType>('SOL');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tokens = [
    { symbol: 'SOL', name: 'Solana', icon: '/tokens/solana.jpeg', color: 'purple' },
    { symbol: 'USDC', name: 'USD Coin', icon: '/tokens/usdc.png', color: 'blue' },
    { symbol: 'USDT', name: 'Tether', icon: '/tokens/usdt.png', color: 'green' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!destinationAddress) {
      setError('Please enter a destination address');
      return;
    }

    try {
      // Get session token
      const sessionToken = localStorage.getItem('anapro_session_token');
      if (!sessionToken) {
        throw new Error('Please sign in again');
      }

      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: selectedToken,
          destinationAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal request failed');
      }

      setSuccess(true);
      setAmount('');
      setDestinationAddress('');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Withdrawal request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Withdraw Funds</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Withdrawal Request Submitted
              </h3>
              <p className="text-slate-600 text-sm">
                Your withdrawal request is pending approval. You'll be notified when it's processed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Token
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {tokens.map((token) => (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => setSelectedToken(token.symbol as TokenType)}
                      className={`p-4 rounded-xl border-2 transition-all ${selectedToken === token.symbol
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-8 h-8 mx-auto mb-2"
                      />
                      <div className="text-xs font-semibold">{token.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Destination Address */}
              <div>
                <label htmlFor="destination" className="block text-sm font-semibold text-slate-700 mb-2">
                  Destination Address
                </label>
                <input
                  type="text"
                  id="destination"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none font-mono text-sm"
                  placeholder="Solana wallet address"
                />
              </div>

              {/* Info Banner */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Manual Processing</p>
                    <p className="text-blue-700">
                      Withdrawal requests are reviewed and processed manually for security.
                      This typically takes 1-24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
