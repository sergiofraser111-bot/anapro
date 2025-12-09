import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Helper to get DB URL safely
function getDbUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is missing');
    return url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[API] Login request');
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // 1. Verify Signature
        try {
            const messageBytes = new TextEncoder().encode(message);
            const signatureBytes = bs58.decode(signature);
            const publicKeyBytes = bs58.decode(walletAddress);
            const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

            if (!verified) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        } catch (e) {
            console.error('Sig verification failed:', e);
            return res.status(401).json({ error: 'Signature verification failed' });
        }

        // 2. Database Operations (Inlined & Fixed Syntax)
        const sql = neon(getDbUrl());

        // Find or Create User
        // Fix: Use tagged template literals
        let existingUsers;
        try {
            existingUsers = await sql`SELECT * FROM users WHERE wallet_address = ${walletAddress}`;
        } catch (dbError: any) {
            // Self-Healing: If table doesn't exist (42P01), create it now
            if (dbError.code === '42P01') {
                console.log('[API] Table missing, attempting self-repair...');
                await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
                await sql`
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        wallet_address TEXT UNIQUE NOT NULL CHECK (length(wallet_address) BETWEEN 32 AND 44),
                        username TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_]+$'),
                        display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
                        email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
                        phone TEXT CHECK (phone IS NULL OR length(phone) BETWEEN 10 AND 20),
                        date_of_birth DATE CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
                        country TEXT CHECK (country IS NULL OR length(country) BETWEEN 2 AND 100),
                        country_code TEXT CHECK (country_code IS NULL OR length(country_code) = 2),
                        profile_complete BOOLEAN DEFAULT false,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                        last_login_at TIMESTAMPTZ,
                        login_count INTEGER DEFAULT 0 CHECK (login_count >= 0)
                    )
                `;
                // Create balances table too as we need it below
                await sql`
                    CREATE TABLE IF NOT EXISTS platform_balances (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        wallet_address TEXT UNIQUE NOT NULL,
                        sol_balance DECIMAL(20, 8) DEFAULT 0 CHECK (sol_balance >= 0),
                        usdc_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_balance >= 0),
                        usdt_balance DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_balance >= 0),
                        sol_locked DECIMAL(20, 8) DEFAULT 0 CHECK (sol_locked >= 0),
                        usdc_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdc_locked >= 0),
                        usdt_locked DECIMAL(20, 8) DEFAULT 0 CHECK (usdt_locked >= 0),
                        total_profit_earned DECIMAL(20, 8) DEFAULT 0 CHECK (total_profit_earned >= 0),
                        total_deposited DECIMAL(20, 8) DEFAULT 0 CHECK (total_deposited >= 0),
                        total_withdrawn DECIMAL(20, 8) DEFAULT 0 CHECK (total_withdrawn >= 0),
                        last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                        CONSTRAINT valid_locked_sol CHECK (sol_locked <= sol_balance + sol_locked),
                        CONSTRAINT valid_locked_usdc CHECK (usdc_locked <= usdc_balance + usdc_locked),
                        CONSTRAINT valid_locked_usdt CHECK (usdt_locked <= usdt_balance + usdt_locked)
                    )
                `;
                await sql`
                    CREATE TABLE IF NOT EXISTS user_sessions (
                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                      wallet_address TEXT NOT NULL,
                      session_token TEXT UNIQUE NOT NULL,
                      signature TEXT NOT NULL,
                      message TEXT NOT NULL,
                      expires_at TIMESTAMPTZ NOT NULL,
                      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                      last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                      ip_address INET,
                      user_agent TEXT,
                      is_active BOOLEAN DEFAULT true,
                      CONSTRAINT valid_expiry CHECK (expires_at > created_at)
                    )
                `;
                console.log('[API] Self-repair complete. Retrying query...');
                // Retry query
                existingUsers = await sql`SELECT * FROM users WHERE wallet_address = ${walletAddress}`;
            } else {
                throw dbError;
            }
        }

        let user;
        if (existingUsers && existingUsers.length > 0) {
            user = existingUsers[0];
            // Update login count
            await sql`UPDATE users SET login_count = login_count + 1, last_login_at = NOW() WHERE id = ${user.id}`;
        } else {
            // Create new user
            const username = `user_${walletAddress.slice(0, 8)}`;
            const displayName = `User ${walletAddress.slice(0, 6)}`;

            const newUsers = await sql`
                INSERT INTO users (wallet_address, username, display_name, profile_complete)
                VALUES (${walletAddress}, ${username}, ${displayName}, false)
                RETURNING *
            `;
            user = newUsers[0];

            // Init balance
            await sql`
                INSERT INTO platform_balances (user_id, wallet_address, sol_balance)
                VALUES (${user.id}, ${walletAddress}, 0)
            `;
        }

        // 3. Create Session
        const token = jwt.sign(
            { sub: user.id, wallet: walletAddress, role: 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Record session
        await sql`
            INSERT INTO user_sessions (user_id, wallet_address, session_token, signature, message, expires_at)
            VALUES (${user.id}, ${walletAddress}, ${token}, ${signature}, ${message}, NOW() + INTERVAL '7 days')
        `;

        return res.status(200).json({
            success: true,
            sessionToken: token,
            user: {
                id: user.id,
                walletAddress: user.wallet_address,
                username: user.username,
                displayName: user.display_name
            }
        });

    } catch (error: any) {
        console.error('[API] Login CRITICAL ERROR:', error);
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
