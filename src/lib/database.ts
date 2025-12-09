import { Pool } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
    const url = process.env.DATABASE_URL || '';
    if (!url) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return url;
}

// Use a global pool to reuse connections across function invocations
// (Best practice for Vercel/Serverless)
let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: getDatabaseUrl(),
        });
    }
    return pool;
}

// Database query helper with error handling
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const p = getPool();

    try {
        const result = await p.query(text, params);
        return result.rows;
    } catch (error: any) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Transaction helper
// Note: In serverless, true transactions across multiple queries require a dedicated client
// This helper checks out a client, runs the callback, and releases it.
export async function transaction<T>(
    callback: (queryFunc: (text: string, params?: any[]) => Promise<any>) => Promise<T>
): Promise<T> {
    const p = getPool();
    const client = await p.connect();

    try {
        await client.query('BEGIN');

        // Create a bound query function for this client
        const queryFunc = async (text: string, params?: any[]) => {
            const result = await client.query(text, params);
            return result.rows;
        };

        const result = await callback(queryFunc);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Health check
export async function healthCheck(): Promise<boolean> {
    try {
        await query('SELECT 1');
        return true;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// Types
// ============================================================================

export interface UserSession {
    id: string;
    user_id: string;
    wallet_address: string;
    session_token: string;
    signature: string;
    message: string;
    expires_at: Date;
    created_at: Date;
    last_activity_at: Date;
    ip_address?: string;
    user_agent?: string;
    is_active: boolean;
}

export interface UserProfile {
    id: string;
    wallet_address: string;
    username: string;
    display_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: Date;
    country?: string;
    country_code?: string;
    profile_complete: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
    login_count: number;
}

export interface PlatformBalance {
    id: string;
    user_id: string;
    wallet_address: string;
    sol_balance: number;
    usdc_balance: number;
    usdt_balance: number;
    sol_locked: number;
    usdc_locked: number;
    usdt_locked: number;
    total_profit_earned: number;
    total_deposited: number;
    total_withdrawn: number;
    last_updated: Date;
    created_at: Date;
}

export interface Transaction {
    id: string;
    user_id: string;
    wallet_address: string;
    type: 'deposit' | 'withdrawal' | 'investment' | 'profit' | 'refund';
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    tx_hash?: string;
    tx_verified: boolean;
    tx_verified_at?: Date;
    description?: string;
    metadata?: any;
    created_at: Date;
    updated_at: Date;
}

export interface Investment {
    id: string;
    user_id: string;
    wallet_address: string;
    plan_name: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT';
    daily_return: number;
    duration_days: number;
    expected_return: number;
    start_date: Date;
    end_date?: Date;
    maturity_date: Date;
    status: 'active' | 'completed' | 'cancelled';
    profit_earned: number;
    last_profit_date: Date;
    created_at: Date;
    updated_at: Date;
}
