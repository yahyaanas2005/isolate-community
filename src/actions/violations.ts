'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Violation } from '@/lib/types/violations';

export async function getViolations(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('violations')
        .select('*')
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false });

    return { data: data as Violation[], error };
}

export async function createViolation(communitySlug: string, data: {
    violator_id: string;
    type: string;
    description: string;
    severity: string;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('violations')
        .insert({
            community_id: tenant.id,
            reported_by: membership.id,
            ...data
        });

    return { error };
}
