import 'dotenv/config';
import { healthCheck } from '../src/lib/database';
import { createAuthChallenge } from '../src/lib/auth';
import crypto from 'crypto';

async function runDebug() {
    console.log('🔍 Starting Local Debug...');

    // 1. Check Env Vars
    console.log('\n1. Checking Environment Variables:');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'CRON_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
        console.error('❌ Missing environment variables:', missingVars.join(', '));
    } else {
        console.log('✅ All required env vars present');
        console.log('   DATABASE_URL:', process.env.DATABASE_URL?.split('@')[1] || 'Hidden (Invalid Format?)'); // Show only host part for security
    }

    // 2. Check Crypto
    console.log('\n2. Checking Crypto Module:');
    try {
        const uuid = crypto.randomUUID();
        console.log('✅ Crypto.randomUUID() works:', uuid);
    } catch (e: any) {
        console.error('❌ Crypto failed:', e.message);
    }

    // 3. Database Connection
    console.log('\n3. Testing Database Connection...');
    try {
        const isConnected = await healthCheck();
        if (isConnected) {
            console.log('✅ Database connected successfully!');
        } else {
            console.error('❌ Database health check returned false');
        }
    } catch (e: any) {
        console.error('❌ Database connection failed with error:', e);
        if (e.message) console.error('   Message:', e.message);
    }

    // 4. Auth Logic
    console.log('\n4. Testing Auth Challenge Logic...');
    try {
        const challenge = createAuthChallenge('TestWalletAddress123');
        console.log('✅ Challenge created successfully:', challenge);
    } catch (e: any) {
        console.error('❌ Auth challenge creation failed:', e);
    }

    console.log('\n🏁 Debug Complete');
}

runDebug().catch(console.error);
