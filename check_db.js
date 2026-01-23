const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyzbhvfjagpjquoufbhh.supabase.co';
// Using the anon key provided by the user
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emJodmZqYWdwanF1b3VmYmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTgzODgsImV4cCI6MjA4NDY5NDM4OH0.2RaRI09yAZcrSeLR6g_vFY3QyVMMGBcOqBPRrfTWrsw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tenants...');
    const { data: tenants, error: tError } = await supabase.from('tenants').select('id').limit(1);
    if (tError) console.error('Tenants Error:', tError.message);
    else console.log('Tenants Table: OK');

    console.log('Checking profiles...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
    if (pError) console.error('Profiles Error:', pError.message);
    else console.log('Profiles Table: OK');

    console.log('Checking memberships...');
    const { data: memberships, error: mError } = await supabase.from('memberships').select('id').limit(1);
    if (mError) console.error('Memberships Error:', mError.message);
    else console.log('Memberships Table: OK');
}

checkTables();
