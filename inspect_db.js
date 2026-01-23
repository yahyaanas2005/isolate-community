const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyzbhvfjagpjquoufbhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emJodmZqYWdwanF1b3VmYmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTgzODgsImV4cCI6MjA4NDY5NDM4OH0.2RaRI09yAZcrSeLR6g_vFY3QyVMMGBcOqBPRrfTWrsw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    console.log('Inspecting memberships columns...');
    // We can't easily query information_schema via supabase-js client directly unless we have a function or direct SQL access.
    // But we can try to insert a dummy object and see the error, OR just select * and look at the structure.

    const { data, error } = await supabase.from('memberships').select('*').limit(1);

    if (error) {
        console.error('Select Error:', error);
    } else {
        console.log('Successfully selected data. Record count:', data.length);
        if (data.length > 0) {
            console.log('First record keys:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot verify columns via select data.');
            // Try to insert a dummy record with JUST random fields to force schema error??
            // No, let's assume the error from user is accurate.
        }
    }
}

inspectColumns();
