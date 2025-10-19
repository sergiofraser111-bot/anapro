import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TOKENS } from '../lib/supabase';

// Initialize Solana connection
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=bcc3a86e-0c0f-4111-a3b2-71f1d968466f';
const connection = new Connection(SOLANA_RPC, 'confirmed');

// SPL Token Program ID
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Export TokenBalance interface
export interface TokenBalance {
  sol: number;
  usdc: number;
  usdt: number;
}

// Re-export for convenience
export type { TokenBalance as TokenBalanceType };

// Get SOL balance
export const getSolBalance = async (walletAddress: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
};

// Get SPL Token balance (USDC, USDT)
export const getTokenBalance = async (
  walletAddress: string,
  tokenMintAddress: string
): Promise<number> => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(tokenMintAddress);

    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Find the specific token account
    const tokenAccount = tokenAccounts.value.find(
      (account) => account.account.data.parsed.info.mint === tokenMint.toString()
    );

    if (!tokenAccount) {
      return 0;
    }

    const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
    console.error(`Error fetching token balance:`, error);
    return 0;
  }
};

// Get all balances (SOL, USDC, USDT)
export const getAllBalances = async (walletAddress: string): Promise<TokenBalance> => {
  try {
    const [sol, usdc, usdt] = await Promise.all([
      getSolBalance(walletAddress),
      getTokenBalance(walletAddress, SOLANA_TOKENS.USDC),
      getTokenBalance(walletAddress, SOLANA_TOKENS.USDT),
    ]);

    return { sol, usdc, usdt };
  } catch (error) {
    console.error('Error fetching all balances:', error);
    return { sol: 0, usdc: 0, usdt: 0 };
  }
};

// Get USD value of balances (you'll need to integrate with a price API)
export const getBalancesInUSD = async (walletAddress: string): Promise<number> => {
  try {
    const balances = await getAllBalances(walletAddress);

    // TODO: Fetch real-time prices from Coingecko/Jupiter
    // For now using approximate prices
    const solPrice = 150; // USD
    const usdcPrice = 1; // USD
    const usdtPrice = 1; // USD

    const totalUSD =
      balances.sol * solPrice +
      balances.usdc * usdcPrice +
      balances.usdt * usdtPrice;

    return totalUSD;
  } catch (error) {
    console.error('Error calculating USD value:', error);
    return 0;
  }
};

// Verify transaction on Solana
export const verifyTransaction = async (signature: string): Promise<boolean> => {
  try {
    const status = await connection.getSignatureStatus(signature);
    return status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized';
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};
