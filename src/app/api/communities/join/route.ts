import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/communities/join
 * Join a community using invite code or public slug
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

        // Parse request body
        const body = await request.json();
        const { code } = body; // Can be invite_code or slug

        if (!code) {
            return NextResponse.json(
                { error: 'Missing invite code or community slug' },
                { status: 400 }
            );
        }

        // Try to find community by invite_code first, then by slug (if public)
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .or(`invite_code.eq.${code.toUpperCase()},and(slug.eq.${code.toLowerCase()},is_public.eq.true)`)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json(
                { error: 'Invalid invite code or community not found' },
                { status: 404 }
            );
        }

        // Check if user is already a member
        const { data: existingMembership } = await supabase
            .from('memberships')
            .select('id, status')
            .eq('tenant_id', tenant.id)
            .eq('user_id', user.id)
            .single();

        if (existingMembership) {
            if (existingMembership.status === 'active') {
                return NextResponse.json(
                    { error: 'You are already a member of this community' },
                    { status: 409 }
                );
            } else {
                // Reactivate inactive/suspended membership
                const { error: updateError } = await supabase
                    .from('memberships')
                    .update({ status: 'active', joined_at: new Date().toISOString() })
                    .eq('id', existingMembership.id);

                if (updateError) {
                    return NextResponse.json(
                        { error: 'Failed to reactivate membership' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: 'Membership reactivated',
                    community: tenant
                });
            }
        }

        // Create new membership
        const { error: membershipError } = await supabase
            .from('memberships')
            .insert({
                user_id: user.id,
                tenant_id: tenant.id,
                role: 'Member',
                status: 'active',
                dynamic_data: {}
            });

        if (membershipError) {
            console.error('Error creating membership:', membershipError);
            return NextResponse.json(
                { error: 'Failed to join community' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully joined community',
            community: tenant
        });

    } catch (error) {
        console.error('Error joining community:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
