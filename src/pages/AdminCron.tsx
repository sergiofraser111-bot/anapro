import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { runProfitCron, processDailyProfits, completeMaturedInvestments } from '../services/profitCron';

export default function AdminCron() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const runFullCron = async () => {
    setIsRunning(true);
    setError('');
    setResults(null);

    try {
      const result = await runProfitCron();
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to run cron job');
    } finally {
      setIsRunning(false);
    }
  };

  const runProfitsOnly = async () => {
    setIsRunning(true);
    setError('');
    setResults(null);

    try {
      const result = await processDailyProfits();
      setResults({ profits: result });
    } catch (err: any) {
      setError(err.message || 'Failed to process profits');
    } finally {
      setIsRunning(false);
    }
  };

  const runMaturityOnly = async () => {
    setIsRunning(true);
    setError('');
    setResults(null);

    try {
      const result = await completeMaturedInvestments();
      setResults({ maturity: result });
    } catch (err: any) {
      setError(err.message || 'Failed to complete matured investments');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin: Profit Cron Job</h1>
          <p className="text-slate-600">
            Manually trigger profit crediting and investment maturity processing
          </p>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Manual Testing Only</h3>
              <p className="text-sm text-yellow-700">
                This page is for testing purposes. In production, this should run automatically via a cron job.
                See CRON_SETUP.md for deployment instructions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <button
            onClick={runFullCron}
            disabled={isRunning}
            className="bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Full Cron
              </>
            )}
          </button>

          <button
            onClick={runProfitsOnly}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Process Profits Only
          </button>

          <button
            onClick={runMaturityOnly}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Complete Matured Only
          </button>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Display */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">Cron Job Completed</h3>
                <p className="text-sm text-slate-600">Results summary below</p>
              </div>
            </div>

            {/* Profit Results */}
            {results.profits && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Daily Profit Processing</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs text-slate-600 mb-1">Total Investments</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.profits.total || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-xs text-green-700 mb-1">Processed</div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.profits.processed || 0}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-xs text-yellow-700 mb-1">Skipped</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.profits.skipped || 0}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-xs text-red-700 mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.profits.failed || 0}
                    </div>
                  </div>
                </div>
                {results.profits.completed > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <div className="text-xs text-blue-700 mb-1">Investments Completed (Reached Maturity)</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.profits.completed}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Maturity Results */}
            {results.maturity && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Matured Investment Processing</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-xs text-slate-600 mb-1">Principal Unlocked</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {results.maturity.processed || 0} investments
                  </div>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900">
                View Raw Results
              </summary>
              <pre className="mt-3 bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8"
        >
          <h3 className="font-semibold text-blue-900 mb-3">What This Does</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>Run Full Cron:</strong> Processes daily profits AND completes matured investments</p>
            <p><strong>Process Profits Only:</strong> Credits daily profit to all active investments based on their daily return rate</p>
            <p><strong>Complete Matured Only:</strong> Unlocks principal for investments that have reached their maturity date</p>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Expected Behavior:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>Profits are credited once per day (won't duplicate if run multiple times same day)</li>
              <li>Profits go to available balance immediately</li>
              <li>Principal stays locked until maturity date</li>
              <li>On maturity, investment status changes to "completed"</li>
              <li>Principal is unlocked to available balance</li>
              <li>Transaction records are created for all operations</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
