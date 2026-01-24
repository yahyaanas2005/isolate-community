const { Client } = require('pg');

const hostname = 'lyzbhvfjagpjquoufbhh.supabase.co'; // Resolves
const dbHostname = 'db.lyzbhvfjagpjquoufbhh.supabase.co'; // For SNI
const password = 'Y3cmEjFh6CbXZRik';

async function run() {
    try {
        console.log(`Connecting to ${hostname} (SNI: ${dbHostname})...`);

        const client = new Client({
            connectionString: `postgres://postgres:${password}@${hostname}:6543/postgres`,
            ssl: {
                rejectUnauthorized: false,
                servername: dbHostname // Force correct SNI for DB
            },
            connectionTimeoutMillis: 10000 // 10s timeout
        });

        console.log('Connecting...');
        await client.connect();
        console.log('Connected! Executing DDL...');

        const sql = `
      BEGIN;
      
      -- Force Reload Config first to clear any stale state
      NOTIFY pgrst, 'reload config';

      DROP TABLE IF EXISTS memberships CASCADE;
   
      CREATE TABLE memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Staff', 'Member')),
          dynamic_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, tenant_id)
      );

      ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public Access" ON memberships FOR ALL USING (true) WITH CHECK (true);
      
      -- Reload again to pick up new table
      NOTIFY pgrst, 'reload config';

      COMMIT;
    `;

        await client.query(sql);
        console.log('SUCCESS: Table Recreated and Schema Reloaded.');

        await client.end();

    } catch (e) {
        console.error('FAILURE:', e.message);
        process.exit(1);
    }
}

run();
