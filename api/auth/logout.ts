import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logout } from '../../src/lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const token = authHeader.substring(7);
        const success = await logout(token);

        if (!success) {
            return res.status(500).json({ error: 'Logout failed' });
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
