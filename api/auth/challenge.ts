import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        console.log('[API] Challenge request received');
        const { walletAddress } = req.body;
        console.log('[API] Wallet:', walletAddress);

        if (!walletAddress) {
            console.warn('[API] Missing wallet address');
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        console.log('[API] Generating challenge...');

        // Inline logic to avoid importing from src/
        const timestamp = Date.now();
        const nonce = crypto.randomUUID();
        const message = `Welcome to Profit Analysis Platform!

Sign this message to authenticate your wallet.

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;

        const challenge = { message, timestamp, nonce };

        console.log('[API] Challenge generated successfully');

        return res.status(200).json(challenge);
    } catch (error: any) {
        console.error('[API] Challenge CRITICAL ERROR:', error);
        return res.status(500).json({
            error: error.message,
            stack: error.stack,
            type: error.constructor.name
        });
    }
}
