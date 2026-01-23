const { Client } = require('pg');

const password = 'Y3cmEjFh6CbXZRik';
const ref = 'lyzbhvfjagpjquoufbhh';
const user = `postgres.${ref}`;

const regions = [
    'aws-0-ap-southeast-1', // User provided (Failed?)
    'aws-0-us-east-1',
    'aws-0-eu-central-1',
    'aws-0-us-west-1',
    'aws-0-sa-east-1',
    'aws-0-ap-northeast-1',
    'aws-0-ap-northeast-2',
    'aws-0-ca-central-1',
    'aws-0-eu-west-1',
    'aws-0-eu-west-2',
    'aws-0-eu-west-3'
];

async function test(region) {
    const host = `${region}.pooler.supabase.com`;
    // We use port 6543 (Transaction) or 5432 (Session) on pooler?
    // Supabase poolers usually listen on 6543 for transaction, 5432 for session.
    // We try 6543.
    const port = 6543;
    const uri = `postgres://${user}:${password}@${host}:${port}/postgres`;

    // console.log(`Testing ${region}...`);
    const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });

    try {
        await client.connect();
        console.log(`SUCCESS: Connected to ${region}!!!!!!`);
        await client.end();
        return true;
    } catch (e) {
        if (e.message.includes('Tenant or user not found')) {
            console.log(`Region ${region}: Tenant Not Found`);
        } else if (e.code === 'ENOTFOUND') {
            console.log(`Region ${region}: DNS Error (Host invalid)`);
        } else {
            console.log(`Region ${region}: OTHER ERROR -> ${e.message} (Code: ${e.code})`);
            // If "password auth failed", we found the region!
        }
        return false;
    }
}

async function run() {
    console.log('Starting Region Discovery...');
    for (const r of regions) {
        const success = await test(r);
        if (success) break;
    }
    console.log('Discovery Complete.');
}

run();
