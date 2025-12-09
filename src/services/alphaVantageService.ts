const ALPHA_VANTAGE_API_KEY = 'B0LQ5C42KT16WL68';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface ForexQuote {
  from_currency: string;
  to_currency: string;
  exchange_rate: string;
  bid_price: string;
  ask_price: string;
  last_refreshed: string;
}

export interface CryptoQuote {
  symbol: string;
  price: string;
  change_24h: string;
  change_percent_24h: string;
}

// Fetch real-time forex exchange rate
export async function getForexQuote(fromCurrency: string, toCurrency: string): Promise<ForexQuote | null> {
  try {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      return {
        from_currency: rate['1. From_Currency Code'],
        to_currency: rate['3. To_Currency Code'],
        exchange_rate: rate['5. Exchange Rate'],
        bid_price: rate['8. Bid Price'],
        ask_price: rate['9. Ask Price'],
        last_refreshed: rate['6. Last Refreshed'],
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Fetch crypto quote from Alpha Vantage
export async function getCryptoQuote(symbol: string, market: string = 'USD'): Promise<CryptoQuote | null> {
  try {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=${market}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      return {
        symbol,
        price: rate['5. Exchange Rate'],
        change_24h: '0', // Alpha Vantage doesn't provide 24h change in this endpoint
        change_percent_24h: '0',
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Fetch multiple forex pairs
export async function getMultipleForexQuotes(pairs: { from: string; to: string }[]): Promise<Map<string, ForexQuote>> {
  const quotes = new Map<string, ForexQuote>();

  // Alpha Vantage has rate limits (5 calls/minute for free tier)
  // We'll fetch them with delays
  for (const pair of pairs) {
    const quote = await getForexQuote(pair.from, pair.to);
    if (quote) {
      quotes.set(`${pair.from}/${pair.to}`, quote);
    }
    // Add delay to respect rate limits (12 seconds between calls = 5 calls/minute)
    await new Promise(resolve => setTimeout(resolve, 12000));
  }

  return quotes;
}

// Get intraday forex data for charts (optional for future use)
export async function getForexIntraday(fromCurrency: string, toCurrency: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
  try {
    const url = `${BASE_URL}?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    return null;
  }
}
