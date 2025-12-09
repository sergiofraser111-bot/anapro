// Application Constants

// Supported SPL tokens on Solana
export const SOLANA_TOKENS = {
    SOL: 'native', // Native SOL
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC SPL Token
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT SPL Token
} as const;

// Platform wallet for deposits (MUST be set in environment variables)
export const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET || '';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Session Configuration
export const SESSION_TOKEN_KEY = 'anapro_session_token';
export const USER_DATA_KEY = 'anapro_user_data';
