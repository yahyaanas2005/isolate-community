'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Notice } from '@/lib/types/notices';

export async function getNotices(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(20);

    return { data: data as Notice[], error };
}

export async function createNotice(communitySlug: string, data: {
    title: string;
    content: string;
    category: string;
    priority: string;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('notices')
        .insert({
            community_id: tenant.id,
            created_by: membership.id,
            ...data
        });

    return { error };
}
