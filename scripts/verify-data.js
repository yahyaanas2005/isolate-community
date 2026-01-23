const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyzbhvfjagpjquoufbhh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emJodmZqYWdwanF1b3VmYmhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTExODM4OCwiZXhwIjoyMDg0Njk0Mzg4fQ.K7SA_7UEoBUHf-5LRFor8-PRvvBHLklK9hAC_sVsZfw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
    const { data, error } = await supabase
        .from('memberships')
        .select('*, profile:profiles(*)')
        .eq('dynamic_data->>unit_number', 'A-101'); // Query by dynamic data to be sure

    if (error) {
        console.error('Verification Error:', error);
    } else {
        console.log('Found Members:', JSON.stringify(data, null, 2));
    }
}

verify();
