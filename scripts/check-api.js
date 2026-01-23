const https = require('https');

const supabaseUrl = 'https://lyzbhvfjagpjquoufbhh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emJodmZqYWdwanF1b3VmYmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTgzODgsImV4cCI6MjA4NDY5NDM4OH0.2RaRI09yAZcrSeLR6g_vFY3QyVMMGBcOqBPRrfTWrsw';

function checkSchema() {
    const url = `${supabaseUrl}/rest/v1/?apikey=${anonKey}`;
    console.log('Fetching:', url);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const defs = json.definitions;
                if (defs && defs.memberships) {
                    console.log('Memberships Definition Properties:', Object.keys(defs.memberships.properties));
                } else {
                    console.log('Memberships definition NOT FOUND in OpenAPI spec');
                    if (defs) console.log('Found definitions:', Object.keys(defs));
                }
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching schema:', err.message);
    });
}

checkSchema();
