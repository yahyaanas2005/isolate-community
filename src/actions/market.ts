'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMarketItems(tenantId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('market_items')
        .select(`
            *,
            seller:profiles!seller_id(full_name, avatar_url)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createListing(
    tenantId: string,
    data: {
        title: string;
        description: string;
        price: number;
        condition: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('market_items')
        .insert({
            tenant_id: tenantId,
            seller_id: user.id,
            title: data.title,
            description: data.description,
            price: data.price,
            condition: data.condition,
            status: 'active'
        });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { success: true };
}
