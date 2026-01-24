import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            tenant_id,
            title,
            description,
            price,
            currency = 'USD',
            condition,
            category,
            images = [],
            location
        } = body;

        // Validate required fields
        if (!tenant_id || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify user is an active member
        const { data: membership } = await supabase
            .from('memberships')
            .select('status')
            .eq('tenant_id', tenant_id)
            .eq('user_id', user.id)
            .single();

        if (!membership || membership.status !== 'active') {
            return NextResponse.json(
                { error: 'You must be an active member to create listings' },
                { status: 403 }
            );
        }

        // Create the listing
        const { data: listing, error: createError } = await supabase
            .from('marketplace_listings')
            .insert({
                tenant_id,
                seller_id: user.id,
                title,
                description,
                price,
                currency,
                condition,
                category,
                images,
                location,
                status: 'ACTIVE'
            })
            .select(`
        *,
        seller:profiles!marketplace_listings_seller_id_fkey(id, full_name, avatar_url, email)
      `)
            .single();

        if (createError) {
            console.error('Error creating marketplace listing:', createError);
            return NextResponse.json(
                { error: 'Failed to create listing' },
                { status: 500 }
            );
        }

        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        console.error('Error in create marketplace listing:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
