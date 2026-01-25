'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Event, EventRSVP } from '@/lib/types/events';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );
}

export async function getEvents(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('community_id', communityId)
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

export async function createEvent(communityId: string, data: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity?: number;
    ticket_price?: number;
}) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('tenant_id', communityId)
        .single();

    if (!membership) return { error: 'Membership not found' };

    const { error } = await supabase
        .from('events')
        .insert({
            community_id: communityId,
            created_by: membership.id,
            ...data
        });

    return { error };
}
