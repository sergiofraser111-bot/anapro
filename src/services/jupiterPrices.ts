const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY || '';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// CoinGecko IDs for our tokens
const TOKEN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
};

export interface TokenPrice {
  id: string;
  symbol: string;
  usdPrice: number;
}

interface CoinGeckoSimplePriceResponse {
  [key: string]: {
    usd: number;
  };
}

// Cache to avoid excessive API calls
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Fetch real-time prices from CoinGecko API
 */
export async function getJupiterPrices(): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  try {
    // Get prices for all tokens in USD
    const ids = Object.values(TOKEN_IDS).join(',');
    const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&x_cg_demo_api_key=${COINGECKO_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoSimplePriceResponse = await response.json();


    // Parse prices
    Object.entries(TOKEN_IDS).forEach(([symbol, coinGeckoId]) => {
      const priceData = data[coinGeckoId];
      if (priceData && priceData.usd) {
        const price = priceData.usd;
        prices.set(symbol, price);

        // Cache the price
        priceCache.set(symbol, {
          price: price,
          timestamp: Date.now(),
        });

      }
    });

    // Ensure we have prices for all tokens (fallback to cache or defaults)
    ['BTC', 'ETH', 'SOL', 'USDC', 'USDT'].forEach((symbol) => {
      if (!prices.has(symbol)) {
        const cached = priceCache.get(symbol);
        if (cached) {
          prices.set(symbol, cached.price);
        } else {
          // Default fallback prices
          let defaultPrice = 1;
          if (symbol === 'BTC') defaultPrice = 43000;
          else if (symbol === 'ETH') defaultPrice = 2300;
          else if (symbol === 'SOL') defaultPrice = 150;

          prices.set(symbol, defaultPrice);
        }
      }
    });

    return prices;
  } catch (error) {

    // Return cached prices if available
    if (priceCache.size > 0) {
      const cachedPrices = new Map<string, number>();
      ['BTC', 'ETH', 'SOL', 'USDC', 'USDT'].forEach((symbol) => {
        const cached = priceCache.get(symbol);
        if (cached) {
          cachedPrices.set(symbol, cached.price);
        } else {
          let defaultPrice = 1;
          if (symbol === 'BTC') defaultPrice = 43000;
          else if (symbol === 'ETH') defaultPrice = 2300;
          else if (symbol === 'SOL') defaultPrice = 150;
          cachedPrices.set(symbol, defaultPrice);
        }
      });
      return cachedPrices;
    }

    // Return default prices as fallback
    return new Map([
      ['BTC', 43000],
      ['ETH', 2300],
      ['SOL', 150],
      ['USDC', 1],
      ['USDT', 1],
    ]);
  }
}

/**
 * Get price for a single token
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  // Check cache first
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  // Fetch all prices and return the requested one
  const prices = await getJupiterPrices();
  let defaultPrice = 1;
  if (symbol === 'BTC') defaultPrice = 43000;
  else if (symbol === 'ETH') defaultPrice = 2300;
  else if (symbol === 'SOL') defaultPrice = 150;
  return prices.get(symbol) || defaultPrice;
}

/**
 * Convert USD to crypto amount
 * @param usdAmount - Amount in USD (plan hardcap like 1000, 2000)
 * @param tokenPrice - Current token price in USD
 * @returns Amount of tokens
 */
export function usdToToken(usdAmount: number, tokenPrice: number): number {
  return usdAmount / tokenPrice;
}

/**
 * Convert crypto amount to USD
 * @param tokenAmount - Amount of tokens
 * @param tokenPrice - Current token price in USD
 * @returns USD value
 */
export function tokenToUsd(tokenAmount: number, tokenPrice: number): number {
  return tokenAmount * tokenPrice;
}

/**
 * Get cached price without API call (for display)
 */
export function getCachedPrice(symbol: string): number {
  const cached = priceCache.get(symbol);
  if (cached) {
    return cached.price;
  }

  // Return reasonable defaults
  switch (symbol) {
    case 'BTC':
      return 43000;
    case 'ETH':
      return 2300;
    case 'SOL':
      return 150;
    case 'USDC':
    case 'USDT':
      return 1;
    default:
      return 1;
  }
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: number, symbol: string): string {
  const decimals = symbol === 'SOL' ? 4 : 2;
  return amount.toFixed(decimals);
}

/**
 * Get CoinGecko ID for a token
 */
export function getTokenId(symbol: string): string {
  return TOKEN_IDS[symbol as keyof typeof TOKEN_IDS] || '';
}
