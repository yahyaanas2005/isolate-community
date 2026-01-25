'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Violation } from '@/lib/types/violations';

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

export async function getViolations(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('violations')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    return { data: data as Violation[], error };
}

export async function createViolation(communityId: string, data: {
    violator_id: string;
    type: string;
    description: string;
    severity: string;
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
        .from('violations')
        .insert({
            community_id: communityId,
            reported_by: membership.id,
            ...data
        });

    return { error };
}
