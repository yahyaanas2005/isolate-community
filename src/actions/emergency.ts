'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EmergencyContact, PanicAlert } from '@/lib/types/emergency';

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

export async function getEmergencyContacts(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('community_id', communityId)
        .order('priority', { ascending: true });

    return { data: data as EmergencyContact[], error };
}

export async function triggerPanicAlert(communityId: string, location?: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('panic_alerts')
        .insert({
            community_id: communityId,
            triggered_by: user.id,
            location,
            status: 'ACTIVE'
        });

    return { error };
}
