import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useLivePrices } from '../hooks/useLivePrices';

export default function LivePriceTicker() {
  const { prices, isLoading } = useLivePrices();

  return (
    <section className="py-10 bg-slate-900 border-y border-slate-800">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 terminal-text flex items-center gap-3">
              Live Market Prices
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4 text-primary-400" />
                </motion.div>
              )}
            </h3>
            <p className="text-sm text-slate-400">Real-time market data via Alpha Vantage</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
            <motion.div
              className="w-2 h-2 bg-success-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-success-400 font-semibold">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((item, index) => (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="terminal-card group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-base font-bold text-white terminal-text mb-1">
                      {item.symbol}
                    </div>
                    <div className="text-xs text-slate-400">{item.name}</div>
                  </div>
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-lg ${
                      item.change >= 0
                        ? 'bg-success-500/20 text-success-400 border-2 border-success-500/50 shadow-success-500/20'
                        : 'bg-error-500/20 text-error-400 border-2 border-error-500/50 shadow-error-500/20'
                    }`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.change >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-base font-extrabold">
                      {Math.abs(item.changePercent).toFixed(2)}%
                    </span>
                  </motion.div>
                </div>

                {/* Bid/Ask for Forex */}
                {item.bid && item.ask ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Bid</span>
                      <span className="text-lg font-bold text-white terminal-text">
                        {item.bid.toFixed(item.symbol.includes('JPY') ? 2 : 4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Ask</span>
                      <span className="text-lg font-bold text-white terminal-text">
                        {item.ask.toFixed(item.symbol.includes('JPY') ? 2 : 4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Spread</span>
                      <span className="text-sm font-bold text-primary-400 terminal-text">
                        {((item.ask - item.bid) * (item.symbol.includes('JPY') ? 100 : 10000)).toFixed(1)} pips
                      </span>
                    </div>
                  </div>
                ) : (
                  // Price for Crypto
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Price</span>
                      <span className="text-xl font-bold text-white terminal-text">
                        ${item.price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">24h Change</span>
                      <motion.span
                        className={`px-3 py-1.5 rounded-lg font-extrabold terminal-text text-base ${
                          item.change >= 0
                            ? 'bg-success-500/20 text-success-400 border border-success-500/50'
                            : 'bg-error-500/20 text-error-400 border border-error-500/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-accent-400/0 group-hover:from-primary-500/5 group-hover:to-accent-400/5 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 terminal-text">
            Prices are indicative and for informational purposes only. Trading involves risk.
          </p>
        </div>
      </div>
    </section>
  );
}
