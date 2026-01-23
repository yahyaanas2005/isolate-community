const { Client } = require('pg');

const password = 'Y3cmEjFh6CbXZRik';
const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
const port = 6543;

// Option 1: username = postgres
const conn1 = `postgres://postgres:${password}@${host}:${port}/postgres`;

async function testConn(name, uri) {
    const client = new Client({
        connectionString: uri,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`Testing ${name}...`);
        await client.connect();
        console.log(`CONNECTED: ${name}`);
        await client.end();
        return true;
    } catch (e) {
        console.log(`FAILED ${name}:`, e.message);
        // console.log(e);
        return false;
    }
}

async function run() {
    // Try Username = postgres
    const s1 = await testConn('Plain User', conn1);
    if (s1) {
        console.log('Use Plain User!');
        // Execute Code
    }
}

run();
