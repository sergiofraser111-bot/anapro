import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from './database.js';
import type { UserSession } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRY = '7d';
const SESSION_EXPIRY_DAYS = 7;

export interface AuthChallenge {
    message: string;
    timestamp: number;
    nonce: string;
}

export interface AuthResult {
    success: boolean;
    sessionToken?: string;
    user?: {
        id: string;
        walletAddress: string;
        username: string;
        displayName: string;
    };
    error?: string;
}

/**
 * Create authentication challenge message for wallet to sign
 */
export function createAuthChallenge(walletAddress: string): AuthChallenge {
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();

    const message = `Welcome to Profit Analysis Platform!

Sign this message to authenticate your wallet.

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;

    return { message, timestamp, nonce };
}

/**
 * Verify wallet signature
 */
export async function verifySignature(
    walletAddress: string,
    signature: string,
    message: string
): Promise<boolean> {
    try {
        // Decode signature from base58
        const signatureUint8 = bs58.decode(signature);

        // Encode message to Uint8Array
        const messageUint8 = new TextEncoder().encode(message);

        // Decode wallet address (public key) from base58
        const publicKeyUint8 = new PublicKey(walletAddress).toBytes();

        // Verify signature using nacl
        const verified = nacl.sign.detached.verify(
            messageUint8,
            signatureUint8,
            publicKeyUint8
        );

        return verified;
    } catch (error) {
        return false;
    }
}

/**
 * Create authenticated session after signature verification
 */
export async function createSession(
    walletAddress: string,
    signature: string,
    message: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    try {
        // Verify signature
        const isValid = await verifySignature(walletAddress, signature, message);

        if (!isValid) {
            return {
                success: false,
                error: 'Invalid signature'
            };
        }

        // Check if user exists
        const users = await query<{ id: string; username: string; display_name: string; is_active: boolean }>(
            'SELECT id, username, display_name, is_active FROM user_profiles WHERE wallet_address = $1',
            [walletAddress]
        );

        if (users.length === 0) {
            return {
                success: false,
                error: 'User not found. Please complete your profile first.'
            };
        }

        const user = users[0];

        if (!user.is_active) {
            return {
                success: false,
                error: 'Account is inactive'
            };
        }

        // Generate JWT token
        const sessionToken = jwt.sign(
            {
                userId: user.id,
                walletAddress,
                timestamp: Date.now()
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

        // Store session in database
        await query(
            `INSERT INTO user_sessions (
        user_id, wallet_address, session_token, signature, message,
        expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [user.id, walletAddress, sessionToken, signature, message, expiresAt.toISOString(), ipAddress, userAgent]
        );

        // Update last login
        await query(
            `UPDATE user_profiles 
       SET last_login_at = NOW(), login_count = login_count + 1 
       WHERE id = $1`,
            [user.id]
        );

        return {
            success: true,
            sessionToken,
            user: {
                id: user.id,
                walletAddress,
                username: user.username,
                displayName: user.display_name
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Authentication failed'
        };
    }
}

/**
 * Verify session token and return user info
 */
export async function verifySession(sessionToken: string): Promise<AuthResult> {
    try {
        // Verify JWT
        try {
            jwt.verify(sessionToken, JWT_SECRET);
        } catch (e: any) {
            return {
                success: false,
                error: `JWT Verification Failed: ${e.message}`
            };
        }

        // Check session in database
        const sessions = await query<UserSession>(
            `SELECT * FROM user_sessions 
       WHERE session_token = $1 
       AND is_active = true 
       AND expires_at > NOW()`,
            [sessionToken]
        );

        if (sessions.length === 0) {
            return {
                success: false,
                error: 'Session Token Not Found in DB (or expired/inactive)'
            };
        }

        const session = sessions[0];

        // Update last activity
        await query(
            'UPDATE user_sessions SET last_activity_at = NOW() WHERE id = $1',
            [session.id]
        );

        // Get user info
        const users = await query<{ id: string; username: string; display_name: string }>(
            'SELECT id, username, display_name FROM users WHERE id = $1',
            [session.user_id]
        );

        if (users.length === 0) {
            return {
                success: false,
                error: `User ID ${session.user_id} Not Found in 'users' Table`
            };
        }

        return {
            success: true,
            sessionToken,
            user: {
                id: users[0].id,
                walletAddress: session.wallet_address,
                username: users[0].username,
                displayName: users[0].display_name
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: 'Invalid session token'
        };
    }
}

/**
 * Logout and invalidate session
 */
export async function logout(sessionToken: string): Promise<boolean> {
    try {
        await query(
            'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
            [sessionToken]
        );
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
    try {
        const result = await query(
            'DELETE FROM user_sessions WHERE expires_at < NOW() RETURNING id'
        );
        return result.length;
    } catch (error) {
        return 0;
    }
}
