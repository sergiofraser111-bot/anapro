import { useState, useEffect, useCallback } from 'react';
import { getForexQuote } from '../services/alphaVantageService';
import { getJupiterPrices } from '../services/jupiterPrices';

export interface PriceData {
  symbol: string;
  name: string;
  bid?: number;
  ask?: number;
  price?: number;
  change: number;
  changePercent: number;
  lastUpdated?: string;
}

interface ForexPair {
  from: string;
  to: string;
  name: string;
}

const FOREX_PAIRS: ForexPair[] = [
  { from: 'EUR', to: 'USD', name: 'Euro / US Dollar' },
  { from: 'GBP', to: 'USD', name: 'British Pound / US Dollar' },
  { from: 'USD', to: 'JPY', name: 'US Dollar / Japanese Yen' },
];

export function useLivePrices() {
  const [prices, setPrices] = useState<PriceData[]>([
    // Initial mock data
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', bid: 1.0856, ask: 1.0858, price: 1.0857, change: 0.0012, changePercent: 0.11 },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', bid: 1.2634, ask: 1.2636, price: 1.2635, change: -0.0023, changePercent: -0.18 },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', bid: 149.82, ask: 149.85, price: 149.83, change: 0.45, changePercent: 0.30 },
    // Crypto (these will still use simulated data as Alpha Vantage crypto API is limited)
    { symbol: 'BTC/USD', name: 'Bitcoin', price: 43250.50, change: 1250.30, changePercent: 2.98 },
    { symbol: 'ETH/USD', name: 'Ethereum', price: 2284.75, change: -45.20, changePercent: -1.94 },
    { symbol: 'SOL/USD', name: 'Solana', price: 98.42, change: 3.18, changePercent: 3.34 },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Store previous prices to calculate change
  const [previousPrices, setPreviousPrices] = useState<Map<string, number>>(new Map());

  const fetchForexPrices = useCallback(async () => {
    const now = Date.now();

    // Rate limit: don't fetch more than once per 15 seconds per pair
    if (now - lastFetchTime < 15000) {
      return;
    }

    setIsLoading(true);

    try {
      // Fetch one pair at a time to avoid rate limits
      // We'll rotate through pairs on each update
      const pairIndex = Math.floor(Date.now() / 60000) % FOREX_PAIRS.length;
      const pair = FOREX_PAIRS[pairIndex];

      const quote = await getForexQuote(pair.from, pair.to);

      if (quote) {
        const symbol = `${pair.from}/${pair.to}`;
        const exchangeRate = parseFloat(quote.exchange_rate);
        const bidPrice = parseFloat(quote.bid_price);
        const askPrice = parseFloat(quote.ask_price);

        // Calculate change from previous price
        const previousPrice = previousPrices.get(symbol) || exchangeRate;
        const change = exchangeRate - previousPrice;
        const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

        setPrices(prevPrices =>
          prevPrices.map(item =>
            item.symbol === symbol
              ? {
                  ...item,
                  bid: bidPrice,
                  ask: askPrice,
                  price: exchangeRate,
                  change: change,
                  changePercent: changePercent,
                  lastUpdated: quote.last_refreshed,
                }
              : item
          )
        );

        // Update previous prices
        setPreviousPrices(prev => new Map(prev).set(symbol, exchangeRate));
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      setLastFetchTime(Date.now());
    }
  }, [lastFetchTime, previousPrices]);

  // Fetch real crypto prices from CoinGecko
  const fetchCryptoPrices = useCallback(async () => {
    try {
      const coinGeckoPrices = await getJupiterPrices();

      setPrices(prevPrices =>
        prevPrices.map(item => {
          // Only update crypto prices
          if (!item.symbol.includes('BTC') && !item.symbol.includes('ETH') && !item.symbol.includes('SOL')) {
            return item;
          }

          // Extract the base symbol (BTC, ETH, SOL)
          const baseSymbol = item.symbol.split('/')[0];
          const newPrice = coinGeckoPrices.get(baseSymbol);

          if (newPrice) {
            // Calculate change from previous price
            const previousPrice = previousPrices.get(item.symbol) || newPrice;
            const change = newPrice - previousPrice;
            const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

            // Update previous prices
            setPreviousPrices(prev => new Map(prev).set(item.symbol, newPrice));

            return {
              ...item,
              price: newPrice,
              change: change,
              changePercent: changePercent,
            };
          }

          return item;
        })
      );
    } catch (error) {
    }
  }, [previousPrices]);

  // Initial fetch
  useEffect(() => {
    fetchForexPrices();
    fetchCryptoPrices();
  }, []);

  // Update forex prices every 60 seconds (respecting API rate limits)
  useEffect(() => {
    const forexInterval = setInterval(() => {
      fetchForexPrices();
    }, 60000); // 1 minute

    return () => clearInterval(forexInterval);
  }, [fetchForexPrices]);

  // Update crypto prices every 30 seconds (real CoinGecko data)
  useEffect(() => {
    const cryptoInterval = setInterval(() => {
      fetchCryptoPrices();
    }, 30000); // 30 seconds to respect API rate limits

    return () => clearInterval(cryptoInterval);
  }, [fetchCryptoPrices]);

  return { prices, isLoading };
}
