'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PatrolLog, Incident } from '@/lib/types/guard';

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

export async function getPatrolLogs(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('patrol_logs')
        .select('*')
        .eq('community_id', communityId)
        .order('started_at', { ascending: false })
        .limit(20);

    return { data: data as PatrolLog[], error };
}

export async function getIncidents(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    return { data: data as Incident[], error };
}

export async function createIncident(communityId: string, data: {
    type: string;
    description: string;
    location: string;
    severity: string;
}) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('incidents')
        .insert({
            community_id: communityId,
            reported_by: user.id,
            ...data
        });

    return { error };
}
