import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createInvestment, getUserInvestments } from '../../src/services/api.js';
import { verifySession } from '../../src/lib/auth.js';
import { lockFundsForInvestment, hasSufficientBalance } from '../../src/services/platformBalance.js';

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
        const userId = authResult.user.id;

        // GET - Get user investments
        if (req.method === 'GET') {
            const { data, error } = await getUserInvestments(walletAddress);

            if (error) {
                return res.status(500).json({ error });
            }

            return res.status(200).json({ success: true, data });
        }

        // POST - Create investment
        if (req.method === 'POST') {
            const investmentData = req.body;

            // Validate required fields
            if (!investmentData.plan_name || !investmentData.amount || !investmentData.currency) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Check sufficient balance
            const hasFunds = await hasSufficientBalance(
                walletAddress,
                investmentData.amount,
                investmentData.currency
            );

            if (!hasFunds) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }

            // Lock funds first
            const { error: lockError } = await lockFundsForInvestment(
                walletAddress,
                investmentData.amount,
                investmentData.currency
            );

            if (lockError) {
                return res.status(500).json({ error: lockError });
            }

            // Create investment
            // Create investment
            let data, error;
            try {
                const result = await createInvestment({
                    ...investmentData,
                    user_id: userId,
                    wallet_address: walletAddress,
                });
                data = result.data;
                error = result.error;

                if (error) {
                    throw new Error(error);
                }
            } catch (createError: any) {
                console.error('Investment creation failed, rolling back funds:', createError);

                // Rollback: Unlock funds
                const { unlockFundsFromInvestment } = await import('../../src/services/platformBalance.js');
                await unlockFundsFromInvestment(
                    walletAddress,
                    investmentData.amount,
                    0, // No profit to unlock, just principal
                    investmentData.currency
                );

                return res.status(500).json({
                    error: 'Failed to create investment record. Funds have been refunded to your available balance. Error: ' + createError.message
                });
            }

            return res.status(201).json({ success: true, data });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
