const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyzbhvfjagpjquoufbhh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emJodmZqYWdwanF1b3VmYmhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTExODM4OCwiZXhwIjoyMDg0Njk0Mzg4fQ.K7SA_7UEoBUHf-5LRFor8-PRvvBHLklK9hAC_sVsZfw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function tryRpc() {
    console.log('Attempting to force schema reload...');

    // 1. Try 'reload_schema' (Common name)
    const { error: e1 } = await supabase.rpc('reload_schema');
    if (e1) console.log('reload_schema failed/not found');
    else console.log('reload_schema SUCCESS!');

    // 2. Try 'reload_config'
    const { error: e2 } = await supabase.rpc('reload_config');
    if (e2) console.log('reload_config failed/not found');
    else console.log('reload_config SUCCESS!');

    // 3. Try to execute SQL if helper exists
    const { error: e3 } = await supabase.rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload config'" });
    if (e3) console.log('exec_sql failed/not found');
    else console.log('exec_sql SUCCESS!');
}

tryRpc();
