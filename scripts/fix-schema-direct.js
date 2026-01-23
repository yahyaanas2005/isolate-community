const { Client } = require('pg');

const connectionString = 'postgres://postgres.lyzbhvfjagpjquoufbhh:Y3cmEjFh6CbXZRik@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
    try {
        console.log('Connecting to Pooler (6543)...');
        await client.connect();
        console.log('Connected!');

        const sql = `
      DROP TABLE IF EXISTS memberships CASCADE;
   
      CREATE TABLE memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Staff', 'Member')),
          dynamic_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, tenant_id)
      );

      ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public Access" ON memberships;
      CREATE POLICY "Public Access" ON memberships FOR ALL USING (true) WITH CHECK (true);
      
      NOTIFY pgrst, 'reload config';
    `;

        console.log('Executing SQL fix...');
        await client.query(sql);
        console.log('SQL Executed Successfully!');

    } catch (err) {
        console.error('DB_ERR_MSG:', err.message);
        if (err.code) console.error('DB_CODE:', err.code);
        if (err.detail) console.error('DB_DETAIL:', err.detail);
        if (err.hint) console.error('DB_HINT:', err.hint);
    } finally {
        await client.end();
    }
}

fixSchema();
