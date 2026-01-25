'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { EmergencyContact, PanicAlert } from '@/lib/types/emergency';

export async function getEmergencyContacts(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('community_id', tenant.id)
        .order('priority', { ascending: true });

    return { data: data as EmergencyContact[], error };
}

export async function triggerPanicAlert(communitySlug: string, location?: string) {
    const { user, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !user || !tenant) {
        return { error: authError || 'Unauthorized' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('panic_alerts')
        .insert({
            community_id: tenant.id,
            triggered_by: user.id,
            location,
            status: 'ACTIVE'
        });

    return { error };
}
