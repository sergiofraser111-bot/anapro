import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiClient } from '../lib/apiClient';
import { SESSION_TOKEN_KEY, USER_DATA_KEY } from '../lib/constants';
import bs58 from 'bs58';

interface User {
    id: string;
    walletAddress: string;
    username: string;
    displayName: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useAuth() {
    const { publicKey, signMessage, disconnect } = useWallet();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Check existing session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const token = localStorage.getItem(SESSION_TOKEN_KEY);

        if (!token) {
            setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return;
        }

        try {
            const result = await apiClient.get<{ success: boolean; user: User }>('/auth/session');

            if (result.success && result.user) {
                setAuthState({
                    user: result.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(result.user));
            } else {
                // Invalid session
                localStorage.removeItem(SESSION_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                // Cast result to any to access potential error property
                const errorMsg = (result as any).error || 'Session verification failed';
                setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: errorMsg });
            }
        } catch (error: any) {
            // Session expired or invalid
            localStorage.removeItem(SESSION_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            const errorMsg = error.message || 'Session verification failed';
            setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: errorMsg });
        }
    };

    const login = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!publicKey || !signMessage) {
            return { success: false, error: 'Wallet not connected' };
        }

        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const walletAddress = publicKey.toString();

            // Step 1: Get challenge
            const challenge = await apiClient.post<{ message: string; timestamp: number; nonce: string }>(
                '/auth/challenge',
                { walletAddress }
            );

            // Step 2: Sign message
            const messageBytes = new TextEncoder().encode(challenge.message);
            const signatureBytes = await signMessage(messageBytes);
            const signature = bs58.encode(signatureBytes);

            // Step 3: Login with signature
            const result = await apiClient.post<{
                success: boolean;
                sessionToken?: string;
                user?: User;
                error?: string;
            }>('/auth/login', {
                walletAddress,
                signature,
                message: challenge.message,
            });

            if (result.success && result.sessionToken && result.user) {
                localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(result.user));

                setAuthState({
                    user: result.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                return { success: true };
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: result.error || 'Login failed',
                }));
                return { success: false, error: result.error };
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Authentication failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, [publicKey, signMessage]);

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Continue with logout even if API call fails
        }

        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });

        if (disconnect) {
            await disconnect();
        }
    }, [disconnect]);

    return {
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        error: authState.error,
        login,
        logout,
        checkSession,
    };
}
