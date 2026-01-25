'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Notice } from '@/lib/types/notices';

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

export async function getNotices(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(20);

    return { data: data as Notice[], error };
}

export async function createNotice(communityId: string, data: {
    title: string;
    content: string;
    category: string;
    priority: string;
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
        .from('notices')
        .insert({
            community_id: communityId,
            created_by: membership.id,
            ...data
        });

    return { error };
}
