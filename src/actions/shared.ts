'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabase() {
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

/**
 * Get membership for the current user in a community by slug
 * This resolves the slug -> tenant_id -> membership lookup
 */
export async function getMembershipBySlug(slug: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, membership: null, tenant: null, error: 'Unauthorized' };
    }

    // First, get the tenant by slug
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return { user, membership: null, tenant: null, error: 'Community not found' };
    }

    // Then get the membership for this user in this tenant
    const { data: membership } = await supabase
        .from('memberships')
        .select('id, role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .single();

    if (!membership) {
        return { user, membership: null, tenant, error: 'Membership not found' };
    }

    return { user, membership, tenant, error: null };
}

/**
 * Get tenant ID from slug
 */
export async function getTenantBySlug(slug: string) {
    const supabase = await getSupabase();
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

    return tenant;
}
