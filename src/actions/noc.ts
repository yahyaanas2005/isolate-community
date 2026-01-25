'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { NOCRequest } from '@/lib/types/noc';

export async function getNOCRequests(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('noc_requests')
        .select('*')
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false });

    return { data: data as NOCRequest[], error };
}

export async function createNOCRequest(communitySlug: string, data: {
    type: string;
    title: string;
    description: string;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('noc_requests')
        .insert({
            community_id: tenant.id,
            requester_id: membership.id,
            ...data
        });

    return { error };
}
