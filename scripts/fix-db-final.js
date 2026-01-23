const { Client } = require('pg');

// Using Resolved IP for db.lyzbhvfjagpjquoufbhh.supabase.co to bypass Node DNS issues
// DNS Result from previous step: 172.64.149.24
const connectionString = 'postgres://postgres:Y3cmEjFh6CbXZRik@172.64.149.24:5432/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false, servername: 'db.lyzbhvfjagpjquoufbhh.supabase.co' }
    // SNI (servername) is critical when using IP, otherwise Cert verification fails
});

async function fixSchema() {
    try {
        console.log('Connecting to Direct DB (IP)...');
        await client.connect();
        console.log('Connected!');

        const sql = `
      BEGIN;

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
      DROP POLICY IF EXISTS "Public Access" ON memberships;
      CREATE POLICY "Public Access" ON memberships FOR ALL USING (true) WITH CHECK (true);
      
      NOTIFY pgrst, 'reload config';

      COMMIT;
    `;

        console.log('Executing SQL fix...');
        await client.query(sql);
        console.log('SQL Executed Successfully!');

    } catch (err) {
        console.error('DB ERROR:', err.message);
    } finally {
        await client.end();
    }
}

fixSchema();
