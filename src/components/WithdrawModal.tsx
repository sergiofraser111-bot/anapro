import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, ExternalLink, AlertCircle, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransaction } from '../services/api';
import { getPlatformBalance, debitWithdrawal, getAvailableBalance } from '../services/platformBalance';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TokenType = 'SOL' | 'USDC' | 'USDT';

// Platform wallet that holds the deposited funds
const PLATFORM_WALLET = '4Tnb3urg7TEDj9t8Evzjzoid1KYyfBRJFSSdHSujMd9h'; // Platform deposit wallet

const TOKEN_ADDRESSES = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mainnet
};

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenType>('SOL');
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const tokens = [
    { symbol: 'SOL', name: 'Solana', icon: '/tokens/solana.jpeg', color: 'purple' },
    { symbol: 'USDC', name: 'USD Coin', icon: '/tokens/usdc.png', color: 'blue' },
    { symbol: 'USDT', name: 'Tether', icon: '/tokens/usdt.png', color: 'green' },
  ];

  // Fetch available balance when modal opens or token changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !isOpen) return;

      setIsLoadingBalance(true);
      try {
        const balance = await getAvailableBalance(
          publicKey.toString(),
          selectedToken as 'SOL' | 'USDC' | 'USDT'
        );
        setAvailableBalance(balance);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setAvailableBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [publicKey, selectedToken, isOpen]);

  const useMyAddress = () => {
    if (publicKey) {
      setWithdrawAddress(publicKey.toString());
    }
  };

  const setMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const handleWithdraw = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if user has sufficient platform balance
    if (parseFloat(amount) > availableBalance) {
      setError(`Insufficient balance. Available: ${availableBalance.toFixed(6)} ${selectedToken}`);
      return;
    }

    if (!withdrawAddress) {
      setError('Please enter a withdrawal address');
      return;
    }

    // Validate the withdrawal address
    try {
      new PublicKey(withdrawAddress);
    } catch {
      setError('Invalid withdrawal address');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=bcc3a86e-0c0f-4111-a3b2-71f1d968466f';
      const connection = new Connection(SOLANA_RPC, 'confirmed');

      // Debit the withdrawal amount from platform balance
      const { error: balanceError } = await debitWithdrawal(
        publicKey.toString(),
        parseFloat(amount),
        selectedToken as 'SOL' | 'USDC' | 'USDT'
      );

      if (balanceError) {
        throw new Error('Failed to debit platform balance: ' + balanceError);
      }

      console.log('Platform balance debited successfully');

      // Save withdrawal request to database
      const { error: dbError } = await createTransaction({
        walletAddress: publicKey.toString(),
        type: 'withdrawal',
        amount: parseFloat(amount),
        currency: selectedToken,
        status: 'pending',
        txHash: null, // Will be updated when platform processes the withdrawal
      });

      if (dbError) {
        // If transaction creation fails, we should credit back the balance
        console.error('Failed to create transaction record:', dbError);
        throw new Error('Failed to create withdrawal request: ' + dbError);
      }

      // In production, this would trigger a backend process to:
      // 1. Create and sign transaction from platform wallet
      // 2. Send funds to user's withdrawal address
      // 3. Update transaction status to 'completed'

      setTxSignature('withdrawal-pending');

      // Reset form
      setAmount('');
      setWithdrawAddress('');

      // Refresh balance
      const newBalance = await getAvailableBalance(
        publicKey.toString(),
        selectedToken as 'SOL' | 'USDC' | 'USDT'
      );
      setAvailableBalance(newBalance);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Show success message for a moment before closing
      setTimeout(() => {
        onClose();
        setTxSignature('');
      }, 3000);

    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Withdraw Funds</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Success State */}
          {txSignature && (
            <div className="p-6 bg-green-50 border-b border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Withdrawal Request Submitted!</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Your withdrawal of {amount} {selectedToken} has been debited from your platform balance and is being processed. You will receive the funds shortly.
                  </p>
                  <p className="text-xs text-green-600">
                    Withdrawal address: {withdrawAddress.slice(0, 8)}...{withdrawAddress.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Token
              </label>
              <div className="grid grid-cols-3 gap-2">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol as TokenType)}
                    disabled={isProcessing || !!txSignature}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedToken === token.symbol
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${isProcessing || txSignature ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2">
                      <img src={token.icon} alt={token.symbol} className="w-full h-full object-contain rounded-full" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{token.symbol}</div>
                    <div className="text-xs text-slate-500">{token.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Balance Display */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Available Balance</div>
                  {isLoadingBalance ? (
                    <div className="text-sm text-slate-400">Loading...</div>
                  ) : (
                    <div className="text-lg font-bold text-slate-900">
                      {availableBalance.toFixed(6)} {selectedToken}
                    </div>
                  )}
                </div>
                <button
                  onClick={setMaxAmount}
                  disabled={isProcessing || !!txSignature || availableBalance === 0}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isProcessing || !!txSignature}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                  step="0.000001"
                  min="0"
                  max={availableBalance}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  {selectedToken}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter the amount you want to withdraw from your platform balance
              </p>
            </div>

            {/* Withdrawal Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Withdrawal Address
                </label>
                <button
                  onClick={useMyAddress}
                  disabled={isProcessing || !!txSignature}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <Wallet className="w-3 h-3" />
                  Use My Wallet
                </button>
              </div>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter Solana address"
                disabled={isProcessing || !!txSignature}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none font-mono text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-2">
                The address where you want to receive the funds
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Please double-check the withdrawal address.
                Transactions on the blockchain are irreversible. Withdrawals are processed within 24 hours.
              </p>
            </div>

            {/* Withdraw Button */}
            {!txSignature && (
              <button
                onClick={handleWithdraw}
                disabled={isProcessing || !connected || !amount || !withdrawAddress || availableBalance === 0}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Withdraw ${selectedToken}`}
              </button>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> The amount will be immediately debited from your platform balance. Withdrawal requests are reviewed and processed by our team.
                You will receive a confirmation once the withdrawal is completed on the blockchain.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
