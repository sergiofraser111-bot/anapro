import { type ReactNode } from 'react';

import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, error } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-600">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Failed</h2>
                    <p className="text-slate-600 mb-6">{error || 'Session verification failed. Please try signing in again.'}</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Retry Verification
                        </button>
                        <button
                            onClick={() => window.location.href = '/signup'}
                            className="w-full py-2 px-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 text-left">
                        <p className="text-xs text-slate-400 font-mono mb-2">Debug Info:</p>
                        <div className="bg-slate-50 p-3 rounded text-xs font-mono text-slate-600 break-all">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
