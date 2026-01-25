'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Event, EventRSVP } from '@/lib/types/events';

export async function getEvents(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('community_id', tenant.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

    return { data: data as Event[], error };
}

export async function createRSVP(eventId: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING', guestsCount: number = 1) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('event_rsvps')
        .upsert({
            event_id: eventId,
            user_id: user.id,
            status,
            guests_count: guestsCount
        }, { onConflict: 'event_id,user_id' });

    return { error };
}

export async function createEvent(communitySlug: string, data: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity?: number;
    ticket_price?: number;
}) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('events')
        .insert({
            community_id: tenant.id,
            created_by: membership.id,
            ...data
        });

    return { error };
}
