'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Listing, ListingStatus } from '@/lib/types/marketplace';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
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

export async function getListings(communityId: string, category?: string) {
    const supabase = await getSupabase();
    let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('community_id', communityId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    return { data: data as Listing[], error };
}

export async function createListing(
    communityId: string,
    data: {
        title: string;
        description: string;
        price: number;
        category: string;
        images?: string[];
    }
) {
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
        .from('marketplace_listings')
        .insert({
            community_id: communityId,
            seller_id: membership.id,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            images: data.images || []
        });

    return { error };
}
