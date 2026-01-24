import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { listing_id, status, ...otherUpdates } = body;

        if (!listing_id) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            );
        }

        // Get the listing to check ownership
        const { data: existingListing } = await supabase
            .from('marketplace_listings')
            .select('seller_id, tenant_id')
            .eq('id', listing_id)
            .single();

        if (!existingListing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        const isSeller = existingListing.seller_id === user.id;

        // Check if user is admin (for hiding/moderating)
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', existingListing.tenant_id)
            .eq('user_id', user.id)
            .single();

        const isAdmin = membership && ['Owner', 'Admin', 'Sub-Admin'].includes(membership.role);

        if (!isSeller && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Build update object
        const updates: any = { ...otherUpdates, updated_at: new Date().toISOString() };

        if (status) {
            updates.status = status;
            if (status === 'SOLD') {
                updates.sold_at = new Date().toISOString();
            }
        }

        // Update the listing
        const { data: updatedListing, error: updateError } = await supabase
            .from('marketplace_listings')
            .update(updates)
            .eq('id', listing_id)
            .select(`
        *,
        seller:profiles!marketplace_listings_seller_id_fkey(id, full_name, avatar_url, email)
      `)
            .single();

        if (updateError) {
            console.error('Error updating marketplace listing:', updateError);
            return NextResponse.json(
                { error: 'Failed to update listing' },
                { status: 500 }
            );
        }

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error('Error in update marketplace listing:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
