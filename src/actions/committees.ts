'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Committee, Meeting } from '@/lib/types/committees';

export async function getCommittees(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('committees')
        .select('*')
        .eq('community_id', tenant.id);

    return { data: data as Committee[], error };
}

export async function getMeetings(committeeId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('committee_id', committeeId)
        .order('meeting_date', { ascending: false });

    return { data: data as Meeting[], error };
}

export async function createCommittee(communitySlug: string, data: {
    name: string;
    description: string;
    type: string;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('committees')
        .insert({
            community_id: tenant.id,
            created_by: membership.id,
            ...data
        });

    return { error };
}
