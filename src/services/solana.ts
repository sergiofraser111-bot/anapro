import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TOKENS } from '../lib/constants';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Get Solana connection
const getRpcUrl = () => {
  return import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
};

const connection = new Connection(getRpcUrl(), 'confirmed');

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
      (account: any) => account.account.data.parsed.info.mint === tokenMint.toString()
    );

    if (!tokenAccount) {
      return 0;
    }

    const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
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
    return { sol: 0, usdc: 0, usdt: 0 };
  }
};

export const getBalancesInUSD = async (walletAddress: string): Promise<number> => {
  try {
    const balances = await getAllBalances(walletAddress);

    const { getJupiterPrices } = await import('./jupiterPrices');
    const pricesMap = await getJupiterPrices();

    const solPrice = pricesMap.get('SOL') || 0;
    const usdcPrice = 1;
    const usdtPrice = 1;

    const totalUSD =
      balances.sol * solPrice +
      balances.usdc * usdcPrice +
      balances.usdt * usdtPrice;

    return totalUSD;
  } catch (error) {
    return 0;
  }
};

// Verify transaction on Solana
export const verifyTransaction = async (signature: string): Promise<boolean> => {
  try {
    const status = await connection.getSignatureStatus(signature);
    return status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized';
  } catch (error) {
    return false;
  }
};
