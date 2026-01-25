'use server';

import { getSupabase, getTenantBySlug } from './shared';
import { StoreProduct, StoreOrder } from '@/lib/types/store';

export async function getStoreProducts(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('community_id', tenant.id)
        .eq('active', true);

    return { data: data as StoreProduct[], error };
}

export async function getMyOrders(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .eq('community_id', tenant.id)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    return { data: data as StoreOrder[], error };
}
