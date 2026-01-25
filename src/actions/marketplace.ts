'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Listing, ListingStatus } from '@/lib/types/marketplace';

export async function getListings(communitySlug: string, category?: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('community_id', tenant.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    return { data: data as Listing[], error };
}

export async function createListing(
    communitySlug: string,
    data: {
        title: string;
        description: string;
        price: number;
        category: string;
        images?: string[];
    }
) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('marketplace_listings')
        .insert({
            community_id: tenant.id,
            seller_id: membership.id,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            images: data.images || []
        });

    return { error };
}
