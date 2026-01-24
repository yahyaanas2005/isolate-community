import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/communities/create
 * Create a new community and assign the creator as Owner
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Initialize Admin Client to bypass RLS for creation
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Parse request body
        const body = await request.json();
        const { name, type, description, is_public = false } = body;

        // Validation
        if (!name || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: name, type' },
                { status: 400 }
            );
        }

        if (!['Physical', 'Professional', 'Virtual'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid community type' },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists (using admin client)
        const { data: existingTenant } = await adminClient
            .from('tenants')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existingTenant) {
            // Add random suffix if slug exists
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            const uniqueSlug = `${slug}-${randomSuffix}`;

            return createCommunity(adminClient, user.id, {
                name,
                slug: uniqueSlug,
                type,
                description,
                is_public
            });
        }

        return createCommunity(adminClient, user.id, {
            name,
            slug,
            type,
            description,
            is_public
        });

    } catch (error: any) {
        console.error('Error creating community:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Helper function to create community and membership using Admin Client
 */
async function createCommunity(
    supabaseAdmin: any,
    userId: string,
    data: {
        name: string;
        slug: string;
        type: string;
        description?: string;
        is_public?: boolean;
    }
) {
    // Generate invite code
    const inviteCode = generateInviteCode();

    // Create tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
            name: data.name,
            slug: data.slug,
            type: data.type,
            description: data.description,
            is_public: data.is_public,
            invite_code: inviteCode,
            settings: {}
        })
        .select()
        .single();

    if (tenantError) {
        console.error('Error creating tenant:', tenantError);

        // Handle unique constraint violation
        if (tenantError.code === '23505') {
            return NextResponse.json(
                { error: 'Community slug already exists. Please try again.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create community: ' + tenantError.message },
            { status: 500 }
        );
    }

    // Create membership with Owner role
    const { error: membershipError } = await supabaseAdmin
        .from('memberships')
        .insert({
            user_id: userId,
            tenant_id: tenant.id,
            role: 'Owner',
            status: 'active',
            dynamic_data: {}
        });

    if (membershipError) {
        console.error('Error creating membership:', membershipError);

        // Rollback: delete the tenant
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);

        return NextResponse.json(
            { error: 'Failed to create membership' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        community: tenant
    });
}

/**
 * Generate random invite code (8 characters, uppercase alphanumeric)
 */
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
