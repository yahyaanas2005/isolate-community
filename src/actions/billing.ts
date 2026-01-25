'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Invoice } from '@/lib/types/billing';

export async function getInvoices(communitySlug: string) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { data: null, error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('member_id', membership.id)
        .order('created_at', { ascending: false });

    return { data: data as Invoice[], error };
}
