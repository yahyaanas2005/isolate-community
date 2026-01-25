'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Invoice } from '@/lib/types/billing';

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

export async function getInvoices(communityId: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('tenant_id', communityId)
        .single();

    if (!membership) return { data: null, error: 'Membership not found' };

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('member_id', membership.id)
        .order('created_at', { ascending: false });

    return { data: data as Invoice[], error };
}
