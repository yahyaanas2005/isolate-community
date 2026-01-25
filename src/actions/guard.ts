'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { PatrolLog, Incident } from '@/lib/types/guard';

export async function getPatrolLogs(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('patrol_logs')
        .select('*')
        .eq('community_id', tenant.id)
        .order('started_at', { ascending: false })
        .limit(20);

    return { data: data as PatrolLog[], error };
}

export async function getIncidents(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false });

    return { data: data as Incident[], error };
}

export async function createIncident(communitySlug: string, data: {
    type: string;
    description: string;
    location: string;
    severity: string;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !user || !tenant) {
        return { error: authError || 'Unauthorized' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('incidents')
        .insert({
            community_id: tenant.id,
            reported_by: user.id,
            ...data
        });

    return { error };
}
