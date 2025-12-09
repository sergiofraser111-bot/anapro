// Shared Solana connection utility
import { Connection } from '@solana/web3.js';

const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(SOLANA_RPC, 'confirmed');

export const getSolanaConnection = () => connection;
