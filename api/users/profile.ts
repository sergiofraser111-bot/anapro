import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserProfile } from '../../src/services/api.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get wallet address from query
        const { wallet } = req.query;

        if (!wallet || typeof wallet !== 'string') {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        // Get user profile
        const { data, error } = await getUserProfile(wallet);

        if (error) {
            return res.status(404).json({ error });
        }

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
