import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Trash2, RefreshCw } from 'lucide-react';

export default function Debug() {
  const { publicKey, connected } = useWallet();
  const [storageData, setStorageData] = useState<any>(null);

  const loadStorageData = () => {
    const data = localStorage.getItem('profitAnalysisUser');
    if (data) {
      try {
        setStorageData(JSON.parse(data));
      } catch (e) {
        setStorageData({ error: 'Failed to parse data' });
      }
    } else {
      setStorageData(null);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const clearStorage = () => {
    if (confirm('Are you sure you want to clear your profile data?')) {
      localStorage.removeItem('profitAnalysisUser');
      setStorageData(null);
      alert('Profile data cleared! You can now create a new profile.');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Debug Page</h1>

        {/* Wallet Section */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Wallet Connection</h2>
          <div className="mb-4">
            <WalletMultiButton />
          </div>
          {connected && publicKey ? (
            <div>
              <p className="text-sm text-slate-600 mb-1">Connected Wallet:</p>
              <p className="text-xs font-mono text-slate-900 bg-slate-50 p-3 rounded border border-slate-200 break-all">
                {publicKey.toString()}
              </p>
            </div>
          ) : (
            <p className="text-slate-600">No wallet connected</p>
          )}
        </div>

        {/* LocalStorage Data Section */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">LocalStorage Data</h2>
            <div className="flex gap-2">
              <button
                onClick={loadStorageData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {storageData && (
                <button
                  onClick={clearStorage}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Data
                </button>
              )}
            </div>
          </div>

          {storageData ? (
            <div>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800 mb-2">Profile Found!</p>
                {connected && publicKey && (
                  <p className="text-xs text-green-700">
                    Wallet Match: {storageData.walletAddress === publicKey.toString() ? '✅ Yes' : '❌ No'}
                  </p>
                )}
              </div>

              <pre className="bg-slate-50 p-4 rounded border border-slate-200 overflow-auto text-xs font-mono">
                {JSON.stringify(storageData, null, 2)}
              </pre>

              {connected && publicKey && storageData.walletAddress !== publicKey.toString() && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Wallet Mismatch</p>
                  <p className="text-xs text-yellow-700 mb-2">
                    The profile in storage belongs to a different wallet address.
                  </p>
                  <p className="text-xs text-yellow-700 mb-1">
                    <strong>Stored:</strong> {storageData.walletAddress}
                  </p>
                  <p className="text-xs text-yellow-700">
                    <strong>Current:</strong> {publicKey.toString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-slate-600">No profile data found in localStorage</p>
              <p className="text-xs text-slate-500 mt-2">
                Connect your wallet and complete the profile to see data here.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Connect your wallet to see if it matches the stored profile</li>
            <li>Click "Refresh" to reload the data from localStorage</li>
            <li>Click "Clear Data" to remove the profile and start fresh</li>
            <li>If there's a wallet mismatch, you'll need to either switch wallets or clear the data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
