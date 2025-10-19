import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransaction, getUserProfile } from '../services/api';
import { creditDeposit, getPlatformBalance, initializePlatformBalance } from '../services/platformBalance';
import { getTokenPrice } from '../services/jupiterPrices';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TokenType = 'SOL' | 'USDC' | 'USDT';

const PLATFORM_WALLET = '4Tnb3urg7TEDj9t8Evzjzoid1KYyfBRJFSSdHSujMd9h'; // Platform deposit wallet

const TOKEN_ADDRESSES = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mainnet
};

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenType>('SOL');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [tokenPrices, setTokenPrices] = useState<{ SOL: number; USDC: number; USDT: number }>({
    SOL: 150,
    USDC: 1,
    USDT: 1,
  });
  const [loadingPrices, setLoadingPrices] = useState(false);

  const tokens = [
    { symbol: 'SOL', name: 'Solana', icon: '/tokens/solana.jpeg', color: 'purple' },
    { symbol: 'USDC', name: 'USD Coin', icon: '/tokens/usdc.png', color: 'blue' },
    { symbol: 'USDT', name: 'Tether', icon: '/tokens/usdt.png', color: 'green' },
  ];

  // Fetch real-time prices from CoinGecko
  useEffect(() => {
    if (isOpen) {
      const fetchPrices = async () => {
        setLoadingPrices(true);
        try {
          const solPrice = await getTokenPrice('SOL');
          const usdcPrice = await getTokenPrice('USDC');
          const usdtPrice = await getTokenPrice('USDT');
          setTokenPrices({ SOL: solPrice, USDC: usdcPrice, USDT: usdtPrice });
        } catch (error) {
          console.error('Error fetching token prices:', error);
        } finally {
          setLoadingPrices(false);
        }
      };

      fetchPrices();

      // Update prices every 30 seconds while modal is open
      const priceInterval = setInterval(fetchPrices, 30000);

      return () => clearInterval(priceInterval);
    }
  }, [isOpen]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(PLATFORM_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Minimum amount validation
    const depositAmount = parseFloat(amount);
    if (selectedToken === 'SOL') {
      if (depositAmount < 0.001) {
        setError('Minimum SOL deposit is 0.001 SOL (~$0.18)');
        return;
      }
    } else {
      if (depositAmount < 1) {
        setError(`Minimum ${selectedToken} deposit is 1 ${selectedToken}`);
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const platformWallet = new PublicKey(PLATFORM_WALLET);

      // For SOL deposits, check if user has enough balance including fees
      if (selectedToken === 'SOL') {
        const balance = await connection.getBalance(publicKey);
        const balanceInSOL = balance / LAMPORTS_PER_SOL;
        const estimatedFee = 0.000005; // ~0.000005 SOL per transaction
        const totalNeeded = depositAmount + estimatedFee;

        if (balanceInSOL < totalNeeded) {
          setError(
            `Insufficient balance. You need ${totalNeeded.toFixed(6)} SOL (${depositAmount.toFixed(6)} deposit + ${estimatedFee.toFixed(6)} fee) but only have ${balanceInSOL.toFixed(6)} SOL`
          );
          setIsProcessing(false);
          return;
        }

        // Warn if depositing almost all SOL
        if (balanceInSOL - depositAmount < 0.001) {
          setError(
            `Warning: You should keep at least 0.001 SOL in your wallet for future transactions. Current balance: ${balanceInSOL.toFixed(6)} SOL`
          );
          setIsProcessing(false);
          return;
        }
      }

      let transaction: Transaction;

      if (selectedToken === 'SOL') {
        // SOL transfer
        const lamports = depositAmount * LAMPORTS_PER_SOL;
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: platformWallet,
            lamports,
          })
        );
      } else {
        // SPL Token transfer (USDC/USDT)
        const mintAddress = new PublicKey(TOKEN_ADDRESSES[selectedToken]);

        // Get associated token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          publicKey
        );

        const toTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          platformWallet
        );

        // Check if destination token account exists
        const toAccountInfo = await connection.getAccountInfo(toTokenAccount);

        transaction = new Transaction();

        // If destination account doesn't exist, create it first
        if (!toAccountInfo) {
          console.log('Creating associated token account for platform wallet...');
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey, // payer
              toTokenAccount, // associated token account
              platformWallet, // owner
              mintAddress // mint
            )
          );
        }

        // Convert amount to token decimals (USDC and USDT use 6 decimals)
        const tokenAmount = parseFloat(amount) * 1_000_000;

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            publicKey,
            tokenAmount,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed:', signature);

      setTxSignature(signature);

      // Get user profile to get user_id for transaction record
      const { data: userProfile } = await getUserProfile(publicKey.toString());

      if (!userProfile) {
        console.error('User profile not found');
        throw new Error('User profile not found. Please complete your profile first.');
      }

      // Save transaction to database
      const { error: dbError } = await createTransaction({
        user_id: userProfile.id,
        wallet_address: publicKey.toString(),
        type: 'deposit',
        amount: parseFloat(amount),
        currency: selectedToken,
        status: 'completed',
        transaction_hash: signature,
      });

      if (dbError) {
        console.error('Failed to save transaction to database:', dbError);
      }

      // Credit platform balance
      console.log('Crediting platform balance...');

      // First, check if platform balance exists, if not initialize it
      const { data: existingBalance } = await getPlatformBalance(publicKey.toString());

      if (!existingBalance) {
        console.log('Initializing platform balance for user:', userProfile.id);
        await initializePlatformBalance(publicKey.toString(), userProfile.id);
      }

      // Credit the deposit
      const { error: balanceError } = await creditDeposit(
        publicKey.toString(),
        parseFloat(amount),
        selectedToken as 'SOL' | 'USDC' | 'USDT'
      );

      if (balanceError) {
        console.error('Failed to credit platform balance:', balanceError);
        // Don't fail the deposit if balance crediting fails - just log it
        // The transaction is already confirmed on-chain
      } else {
        console.log('Platform balance credited successfully');
      }

      // Reset form
      setAmount('');

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
      console.error('Deposit error:', err);
      setError(err.message || 'Failed to process deposit. Please try again.');
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
            <h2 className="text-2xl font-bold text-slate-900">Deposit Funds</h2>
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
                  <h3 className="font-semibold text-green-900 mb-1">Deposit Successful!</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Your {amount} {selectedToken} has been deposited and credited to your platform balance.
                  </p>
                  <a
                    href={`https://solscan.io/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium"
                  >
                    View on Solscan <ExternalLink className="w-3 h-3" />
                  </a>
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

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Amount
                </label>
                <span className="text-xs text-slate-500">
                  Min: {selectedToken === 'SOL' ? '0.001 SOL' : `1 ${selectedToken}`}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={selectedToken === 'SOL' ? '0.001' : '1.00'}
                  disabled={isProcessing || !!txSignature}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                  step={selectedToken === 'SOL' ? '0.001' : '1'}
                  min={selectedToken === 'SOL' ? '0.001' : '1'}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  {selectedToken}
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-2">
                {selectedToken === 'SOL' ? (
                  <>
                    <button
                      onClick={() => setAmount('0.001')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      0.001 SOL
                    </button>
                    <button
                      onClick={() => setAmount('0.005')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      0.005 SOL
                    </button>
                    <button
                      onClick={() => setAmount('0.01')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      0.01 SOL
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setAmount('1')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      1 {selectedToken}
                    </button>
                    <button
                      onClick={() => setAmount('10')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      10 {selectedToken}
                    </button>
                    <button
                      onClick={() => setAmount('50')}
                      disabled={isProcessing || !!txSignature}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      50 {selectedToken}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Real-Time Price Display */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Current {selectedToken} Price</span>
                  {loadingPrices && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                    </motion.div>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    ${tokenPrices[selectedToken].toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: selectedToken === 'SOL' ? 2 : 4
                    })}
                  </span>
                  <span className="text-sm text-slate-500">per {selectedToken}</span>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3 border-t border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">USD Value</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${(parseFloat(amount) * tokenPrices[selectedToken]).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Platform Wallet Address */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600">
                  Platform Wallet
                </label>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono text-slate-900 break-all">
                {PLATFORM_WALLET}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Deposit Button */}
            {!txSignature && (
              <button
                onClick={handleDeposit}
                disabled={isProcessing || !connected || !amount}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Deposit ${selectedToken}`}
              </button>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="space-y-2">
                <p className="text-xs text-blue-800">
                  <strong>Important:</strong> Your deposit will be processed on the Solana blockchain and automatically credited to your platform balance.
                </p>
                <ul className="text-xs text-blue-700 space-y-1 pl-4 list-disc">
                  <li>Minimum deposit: {selectedToken === 'SOL' ? '0.001 SOL (~$0.18)' : `1 ${selectedToken}`}</li>
                  <li>Transaction fee: ~0.000005 SOL (paid from your wallet)</li>
                  {selectedToken === 'SOL' && (
                    <li>Keep at least 0.001 SOL in your wallet for future transactions</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
