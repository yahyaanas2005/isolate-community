import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { query, communitySlug } = await request.json();

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Initialize Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get user from session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First, resolve slug to tenant UUID
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id, slug')
            .eq('slug', communitySlug)
            .single();

        if (!tenant) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        const communityId = tenant.id;  // This is now the proper UUID

        // Get user's membership to check permissions
        const { data: membership } = await supabase
            .from('memberships')
            .select('id, role')
            .eq('user_id', user.id)
            .eq('tenant_id', communityId)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No membership found' }, { status: 403 });
        }

        const results: any[] = [];

        // Search across all modules with permission checks
        const searchTerm = `%${query}%`;

        // 1. Search Tickets (Help Desk)
        const { data: tickets } = await supabase
            .from('tickets')
            .select('id, title, description, created_at')
            .eq('community_id', communityId)
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);

        tickets?.forEach(ticket => {
            results.push({
                id: ticket.id,
                type: 'ticket',
                title: ticket.title,
                description: ticket.description,
                url: `/dashboard/${communitySlug}/helpdesk`,
                relevance: 1.0
            });
        });

        // 2. Search Notices
        const { data: notices } = await supabase
            .from('notices')
            .select('id, title, content, created_at')
            .eq('community_id', communityId)
            .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
            .limit(5);

        notices?.forEach(notice => {
            results.push({
                id: notice.id,
                type: 'notice',
                title: notice.title,
                description: notice.content?.slice(0, 150) || '',
                url: `/dashboard/${communitySlug}/notices`,
                relevance: 0.9
            });
        });

        // 3. Search Events
        const { data: events } = await supabase
            .from('events')
            .select('id, title, description, event_date')
            .eq('community_id', communityId)
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);

        events?.forEach(event => {
            results.push({
                id: event.id,
                type: 'event',
                title: event.title,
                description: event.description,
                url: `/dashboard/${communitySlug}/events`,
                relevance: 0.8
            });
        });

        // 4. Search Marketplace
        const { data: listings } = await supabase
            .from('marketplace_listings')
            .select('id, title, description, price')
            .eq('community_id', communityId)
            .eq('status', 'ACTIVE')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);

        listings?.forEach(listing => {
            results.push({
                id: listing.id,
                type: 'listing',
                title: listing.title,
                description: `$${listing.price} - ${listing.description}`,
                url: `/dashboard/${communitySlug}/marketplace`,
                relevance: 0.7
            });
        });

        // 5. Search Violations (Admin only)
        if (membership.role === 'Owner' || membership.role === 'Admin') {
            const { data: violations } = await supabase
                .from('violations')
                .select('id, type, description, severity')
                .eq('community_id', communityId)
                .or(`type.ilike.${searchTerm},description.ilike.${searchTerm}`)
                .limit(5);

            violations?.forEach(violation => {
                results.push({
                    id: violation.id,
                    type: 'violation',
                    title: violation.type,
                    description: violation.description,
                    url: `/dashboard/${communitySlug}/violations`,
                    relevance: 0.6
                });
            });
        }

        // 6. Search NOC Requests
        const { data: nocRequests } = await supabase
            .from('noc_requests')
            .select('id, title, description, status')
            .eq('community_id', communityId)
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);

        nocRequests?.forEach(noc => {
            results.push({
                id: noc.id,
                type: 'noc',
                title: noc.title,
                description: noc.description,
                url: `/dashboard/${communitySlug}/requests`,
                relevance: 0.5
            });
        });

        // 7. Search Visitors (Security)
        const { data: visitors } = await supabase
            .from('visitors')
            .select('id, name, purpose, created_at')
            .eq('community_id', communityId)
            .or(`name.ilike.${searchTerm},purpose.ilike.${searchTerm}`)
            .limit(5);

        visitors?.forEach(visitor => {
            results.push({
                id: visitor.id,
                type: 'visitor',
                title: visitor.name,
                description: visitor.purpose,
                url: `/dashboard/${communitySlug}/security`,
                relevance: 0.4
            });
        });

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        return NextResponse.json({ results: results.slice(0, 20) });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
    }
}
