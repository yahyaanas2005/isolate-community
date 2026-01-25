'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Committee, Meeting } from '@/lib/types/committees';

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

export async function getCommittees(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('committees')
        .select('*')
        .eq('community_id', communityId);

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
