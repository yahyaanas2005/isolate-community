'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { StoreProduct, StoreOrder } from '@/lib/types/store';

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

export async function getStoreProducts(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('community_id', communityId)
        .eq('active', true);

    return { data: data as StoreProduct[], error };
}

export async function getMyOrders(communityId: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .eq('community_id', communityId)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    return { data: data as StoreOrder[], error };
}
