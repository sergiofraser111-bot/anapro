export interface Trader {
  name: string;
  username: string;
  gain: string;
  funds: string;
  image: string;
  trades: string;
}

export const baseTraders: Trader[] = [
  { name: 'Winona A. Livingston', username: 'Winona', gain: '+236%', funds: '$1,850,850', image: '/traders/winona.jpeg', trades: '15 trades' },
  { name: 'Crypto John', username: 'CryptoJM', gain: '+14.99%', funds: '$650,850', image: '/traders/crypto-john.png', trades: '20 trades' },
  { name: 'Matthew Giannino', username: 'Matte-2', gain: '+13.00%', funds: '$482,600', image: '/traders/matthew.jpeg', trades: '38 trades' },
  { name: 'Amelia Beryl', username: 'Chocoholic-s', gain: '+18.21%', funds: '$500,450', image: 'https://randomuser.me/api/portraits/women/44.jpg', trades: '42 trades' },
  { name: 'Jordan Archer', username: 'JordanChase', gain: '+5290.45%', funds: '$451,068', image: 'https://randomuser.me/api/portraits/men/32.jpg', trades: '56 trades' },
  { name: 'Logan Smith', username: 'BlueFxHill', gain: '+5497.00%', funds: '$516,347', image: 'https://randomuser.me/api/portraits/men/46.jpg', trades: '63 trades' },
  { name: 'James Harrison', username: 'TradeWithJames', gain: '+7328.22%', funds: '$492,000', image: 'https://randomuser.me/api/portraits/men/52.jpg', trades: '48 trades' },
  { name: 'Victor Cordeiro', username: 'Centronx', gain: '+5590.90%', funds: '$412,000', image: 'https://randomuser.me/api/portraits/men/67.jpg', trades: '71 trades' },
  { name: 'Sophia Martinez', username: 'SophiaTrades', gain: '+12.45%', funds: '$785,300', image: 'https://randomuser.me/api/portraits/women/65.jpg', trades: '34 trades' },
  { name: 'Ethan Williams', username: 'EthanWFx', gain: '+22.67%', funds: '$623,150', image: 'https://randomuser.me/api/portraits/men/22.jpg', trades: '52 trades' },
  { name: 'Isabella Chen', username: 'BellaCrypto', gain: '+18.93%', funds: '$891,400', image: 'https://randomuser.me/api/portraits/women/68.jpg', trades: '45 trades' },
  { name: 'Michael Brown', username: 'MikeBTrader', gain: '+31.28%', funds: '$1,125,600', image: 'https://randomuser.me/api/portraits/men/83.jpg', trades: '67 trades' },
  { name: 'Emma Thompson', username: 'EmmaInvests', gain: '+9.84%', funds: '$432,800', image: 'https://randomuser.me/api/portraits/women/90.jpg', trades: '29 trades' },
  { name: 'Daniel Rodriguez', username: 'DanRodFx', gain: '+15.42%', funds: '$567,900', image: 'https://randomuser.me/api/portraits/men/36.jpg', trades: '41 trades' },
  { name: 'Olivia Garcia', username: 'OlivTrader', gain: '+27.33%', funds: '$934,200', image: 'https://randomuser.me/api/portraits/women/75.jpg', trades: '58 trades' },
  { name: 'Alexander Kim', username: 'AlexKTrades', gain: '+19.76%', funds: '$712,500', image: 'https://randomuser.me/api/portraits/men/91.jpg', trades: '36 trades' },
  { name: 'Charlotte Davis', username: 'CharlieD_Fx', gain: '+11.29%', funds: '$398,600', image: 'https://randomuser.me/api/portraits/women/26.jpg', trades: '31 trades' },
  { name: 'Ryan Anderson', username: 'RyanAndFx', gain: '+25.54%', funds: '$837,521', image: 'https://randomuser.me/api/portraits/men/62.jpg', trades: '49 trades' },
  { name: 'Ava Johnson', username: 'AvaJTrades', gain: '+16.54%', funds: '$645,900', image: 'https://randomuser.me/api/portraits/women/17.jpg', trades: '44 trades' },
  { name: 'Benjamin Lee', username: 'BenLeeFx', gain: '+29.91%', funds: '$1,012,300', image: 'https://randomuser.me/api/portraits/men/71.jpg', trades: '62 trades' },
];

// Seeded random number generator for consistent shuffling per hour
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Shuffle array with seed
const shuffleWithSeed = (array: Trader[], seed: number): Trader[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate slight variations in trader stats
const varyStats = (trader: Trader, seed: number): Trader => {
  const variation = seededRandom(seed);

  // Parse current gain percentage
  const gainMatch = trader.gain.match(/([+-]?\d+(?:,\d+)?(?:\.\d+)?)/);
  const baseGain = gainMatch ? parseFloat(gainMatch[1].replace(',', '')) : 0;

  // Add variation: ±5% of current value
  const newGain = baseGain + (variation - 0.5) * baseGain * 0.1;
  const formattedGain = newGain >= 0 ? `+${newGain.toFixed(2)}%` : `${newGain.toFixed(2)}%`;

  // Parse funds
  const fundsMatch = trader.funds.match(/\$([0-9,]+)/);
  const baseFunds = fundsMatch ? parseInt(fundsMatch[1].replace(/,/g, '')) : 0;

  // Add variation to funds: ±3%
  const newFunds = Math.floor(baseFunds + (variation - 0.5) * baseFunds * 0.06);
  const formattedFunds = `$${newFunds.toLocaleString()}`;

  return {
    ...trader,
    gain: formattedGain,
    funds: formattedFunds,
  };
};

// Get traders for current hour
export const getHourlyTraders = (): Trader[] => {
  const now = new Date();
  const hourSeed = now.getFullYear() * 8760 + now.getMonth() * 730 + now.getDate() * 24 + now.getHours();

  // Shuffle traders
  const shuffled = shuffleWithSeed(baseTraders, hourSeed);

  // Apply variations to stats
  const varied = shuffled.map((trader, index) => varyStats(trader, hourSeed + index));

  return varied;
};

// Get top 3 traders
export const getTop3Traders = (): Trader[] => {
  return getHourlyTraders().slice(0, 3);
};

// Get last update time
export const getLastUpdateTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const offset = '+02:00'; // GMT +02:00
  return `${hours}:${minutes} GMT ${offset}`;
};
