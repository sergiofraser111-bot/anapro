import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { updateTransactionStatus } from '../../src/services/api.js';
import { creditDeposit, initializePlatformBalance, getPlatformBalance } from '../../src/services/platformBalance.js';
import { query } from '../../src/lib/database.js';
import { PLATFORM_WALLET, SOLANA_TOKENS } from '../../src/lib/constants.js';

const SOLANA_RPC = process.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Helper to verify SOL transfer
function verifySolTransfer(transaction: any, platformWallet: string, amount: number): boolean {
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);
    const instructions = transaction.transaction.message.instructions;

    // Look for system transfer to platform wallet
    for (const ix of instructions) {
        // Simple check: Program ID must be System Program (11111...)
        // In parsed format, we look for program === 'system' and type === 'transfer'
        // But since we are using getTransaction which might return compiled or parsed...
        // Let's assume standard connection.getTransaction returns parsed if we ask?
        // We requested maxSupportedTransactionVersion: 0. Default doesn't parse.
        // We will request parsed encoding.
    }
    return false;
    // Complexity note: Parsing raw instructions in JS without full SDK types is brittle.
    // For this environment, we will refine the getTransaction call to return JSONParsed.
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { txSignature, walletAddress, amount, currency, userId, transactionId } = req.body;

        if (!txSignature || !walletAddress || !amount || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Double Spend Check (Idempotency)
        const existingTx = await query(
            'SELECT id FROM transactions WHERE tx_hash = $1 AND status = \'completed\'',
            [txSignature]
        );

        if (existingTx.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Transaction already processed'
            });
        }

        // 2. Connect to Solana
        const connection = new Connection(SOLANA_RPC, 'confirmed');

        // 3. Fetch Transaction with Parsed Instructions
        const transaction = await connection.getParsedTransaction(txSignature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found on blockchain'
            });
        }

        if (!transaction.meta || transaction.meta.err) {
            return res.status(400).json({
                success: false,
                error: 'Transaction failed or not confirmed'
            });
        }

        // 4. Verify Transfer Details (Recipient & Amount)
        let verified = false;
        const targetAmount = parseFloat(amount);
        const platformPubkey = PLATFORM_WALLET;

        // Iterate through instructions to find the matching transfer
        if (currency === 'SOL') {
            const expectedLamports = Math.round(targetAmount * LAMPORTS_PER_SOL);

            // Allow small delta for float math (1000 lamports)
            const tolerance = 5000;

            // Check top-level instructions
            for (const ix of transaction.transaction.message.instructions) {
                if ('parsed' in ix && ix.program === 'system' && ix.parsed.type === 'transfer') {
                    const info = ix.parsed.info;

                    if (info.destination === platformPubkey) {
                        const actualLamports = parseInt(info.lamports);
                        if (Math.abs(actualLamports - expectedLamports) < tolerance) {
                            verified = true;
                            break;
                        }
                    }
                }
            }

            // Also check inner instructions if not found (though rare for direct deposits)
            if (!verified && transaction.meta.innerInstructions) {
                for (const inner of transaction.meta.innerInstructions) {
                    for (const ix of inner.instructions) {
                        if ('parsed' in ix && ix.program === 'system' && ix.parsed.type === 'transfer') {
                            const info = ix.parsed.info;
                            if (info.destination === platformPubkey) {
                                const actualLamports = parseInt(info.lamports);
                                if (Math.abs(actualLamports - expectedLamports) < tolerance) {
                                    verified = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (verified) break;
                }
            }

        } else {
            // SPL Token Verification (USDC/USDT)
            // Need to match: Destination (Associated Token Account of Platform), Amount (Decimals), and Mint
            const targetToken = SOLANA_TOKENS[currency as keyof typeof SOLANA_TOKENS];
            if (!targetToken) throw new Error('Unsupported currency');

            const expectedAmountUnits = Math.round(targetAmount * 1_000_000); // 6 decimals for USDC/USDT

            // Find platform's ATA for this token ??
            // OR: parsed instructions usually confirm "transfer info" includes source/dest. 
            // The destination in a transferChecked or transfer instruction is a Token Account, not the Wallet.
            // verifying strict destination ownership is complex without deriving ATA.
            // Simplified Check: Did *any* account owned by PLATFORM_WALLET receive this amount of this Mint?

            // Better approach: Look at postTokenBalances
            if (transaction.meta.postTokenBalances && transaction.meta.preTokenBalances) {
                const platformBalanceChange = transaction.meta.postTokenBalances.find(b => b.owner === platformPubkey && b.mint === targetToken);
                const preBalance = transaction.meta.preTokenBalances.find(b => b.owner === platformPubkey && b.mint === targetToken);

                const postAmount = platformBalanceChange?.uiTokenAmount?.uiAmount || 0;
                const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
                const received = postAmount - preAmount;

                // Check if received amount matches target amount (approx)
                if (Math.abs(received - targetAmount) < 0.0001) {
                    verified = true;
                }
            }
        }

        if (!verified) {
            console.error(`Verification Failed: Expected ${amount} ${currency} to ${platformPubkey}`);
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed. Could not find matching transfer to platform wallet.'
            });
        }

        // Initialize balance if needed
        const { data: existingBalance } = await getPlatformBalance(walletAddress);
        if (!existingBalance && userId) {
            await initializePlatformBalance(walletAddress, userId);
        }

        // Credit the deposit
        const { error: creditError } = await creditDeposit(
            walletAddress,
            targetAmount,
            currency as 'SOL' | 'USDC' | 'USDT'
        );

        if (creditError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to credit deposit: ' + creditError
            });
        }

        // Update transaction status if transactionId provided, OR create one if missing (to prevent replay)
        if (transactionId) {
            await updateTransactionStatus(transactionId, 'completed', txSignature);
        } else {
            // "Infinite Money Glitch" Prevention:
            // We MUST record this signature as completed in the DB, otherwise the Double Spend Check (Step 1) 
            // will never find it, allowing the user to call this endpoint infinitely.
            await query(
                `INSERT INTO transactions 
                (user_id, wallet_address, type, amount, currency, status, tx_hash, tx_verified, tx_verified_at, description)
                VALUES ($1, $2, 'deposit', $3, $4, 'completed', $5, true, NOW(), 'Direct API Verification')`,
                [userId, walletAddress, parseFloat(amount), currency, txSignature]
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Deposit verified and credited',
            verified: true
        });
    } catch (error: any) {
        console.error('Verify handler error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
