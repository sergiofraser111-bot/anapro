import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransaction, getUserTransactions } from '../../src/services/api.js';
import { verifySession } from '../../src/lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const authResult = await verifySession(token);

        if (!authResult.success || !authResult.user) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const walletAddress = authResult.user.walletAddress;

        // GET - Get user transactions
        if (req.method === 'GET') {
            const { data, error } = await getUserTransactions(walletAddress);

            if (error) {
                return res.status(500).json({ error });
            }

            return res.status(200).json({ success: true, data });
        }

        // POST - Create transaction
        if (req.method === 'POST') {
            const transactionData = req.body;

            // Validate required fields
            if (!transactionData.type || !transactionData.amount || !transactionData.currency) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Create transaction
            const { data, error } = await createTransaction({
                ...transactionData,
                wallet_address: walletAddress,
            });

            if (error) {
                return res.status(500).json({ error });
            }

            return res.status(201).json({ success: true, data });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
