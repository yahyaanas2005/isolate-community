'use server';

import { createClient } from '@/utils/supabase/server';

export async function exportMembersToCSV(tenantId: string) {
    const supabase = await createClient();
    const { data: members, error } = await supabase
        .from('memberships')
        .select(`
            status, role, joined_at,
            profile:profiles(full_name, email, phone)
        `)
        .eq('tenant_id', tenantId);

    if (error || !members) return { error: error?.message || 'No data' };

    // Simply returning JSON, client converts to CSV usually, 
    // or we construct CSV string here.
    const csvHeader = 'Name,Email,Phone,Role,Status,Joined At\n';
    const csvRows = members.map((m: any) => {
        return [
            `"${m.profile?.full_name || ''}"`,
            `"${m.profile?.email || ''}"`,
            `"${m.profile?.phone || ''}"`,
            m.role,
            m.status,
            m.joined_at
        ].join(',');
    });

    return { csv: csvHeader + csvRows.join('\n') };
}

export async function exportFinanceToCSV(tenantId: string) {
    // Placeholder for finance export
    return { csv: 'Date,Description,Amount,Type\n2025-01-01,Maintenance,500.00,Invoice' };
}
