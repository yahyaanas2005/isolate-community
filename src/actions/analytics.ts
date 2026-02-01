'use server';

import { createClient } from '@/utils/supabase/server';

export async function getCommunityStats(tenantId: string) {
    const supabase = await createClient();

    // 1. Complaint Stats
    const { count: totalComplaints } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

    const { count: pendingComplaints } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .in('status', ['new', 'assigned', 'in_progress', 'escalated']);

    const { count: resolvedComplaints } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'resolved');

    // 2. Membership Stats
    const { count: totalMembers } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

    const { count: pendingMembers } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'pending');

    // 3. Financial Stats (Simple Sum - Requires raw query or manual sum in JS)
    // For MVP/No-function: Fetch unpaid invoices and sum them up
    const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('amount, amount_paid')
        .eq('tenant_id', tenantId)
        .eq('status', 'sent'); // or 'overdue'

    const totalPendingDues = unpaidInvoices?.reduce((acc, inv) => acc + (inv.amount - (inv.amount_paid || 0)), 0) || 0;

    // 4. Notices
    const { count: activeNotices } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'published');

    return {
        complaints: {
            total: totalComplaints || 0,
            pending: pendingComplaints || 0,
            resolved: resolvedComplaints || 0
        },
        members: {
            total: totalMembers || 0,
            pending: pendingMembers || 0
        },
        finance: {
            pendingDues: totalPendingDues
        },
        notices: {
            active: activeNotices || 0
        }
    };
}
