'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/lib/types/helpdesk';

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
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function getTickets(communityId: string, status?: TicketStatus): Promise<{ data: Ticket[] | null; error: any }> {
    const supabase = await getSupabase();
    let query = supabase
        .from('tickets')
        .select(`
      *,
      category:ticket_categories(id, name),
      creator:profiles!tickets_created_by_fkey(full_name, avatar_url)
    `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    // Note: creator relation depends on how profiles are linked. 
    // Based on schemas, tickets.created_by -> memberships.id. 
    // We need to fetch membership -> profile to get name.
    // The query above assumes direct relation to profile or view support, which might fail if relations are complex.
    // Let's adjust to be safer or fix later. For now, we'll try standard select.
    // Actually, tickets.created_by references memberships(id). 
    // Memberships usually references profiles(user_id) or similar.
    // Standard Supabase query might be tricky with double join in one go without flattened view.
    // Simplified query for now:

    const { data, error } = await supabase
        .from('tickets')
        .select(`
        *,
        category:ticket_categories(id, name)
    `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    // We might want to fetch creator names client side or via a view for performance if double nesting is hard.
    // Or create a view `tickets_view` that joins memberships and profiles.

    return { data: data as Ticket[], error };
}

export async function getTicketCategories(communityId: string): Promise<{ data: TicketCategory[] | null; error: any }> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('community_id', communityId);

    return { data: data as TicketCategory[], error };
}

export async function createTicket(
    communityId: string,
    data: {
        title: string;
        description: string;
        category_id: string;
        priority: TicketPriority;
        tower?: string;
        unit_id?: string;
    }
) {
    const supabase = await getSupabase();

    // 1. Get current user's membership ID for this community
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
        .from('tickets')
        .insert({
            community_id: communityId,
            created_by: membership.id,
            title: data.title,
            description: data.description,
            category_id: data.category_id,
            priority: data.priority,
            tower: data.tower,
            unit_id: data.unit_id
        });

    return { error };
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
    return { error };
}

export async function getTicket(ticketId: string): Promise<{ data: Ticket | null; error: any }> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('tickets')
        .select(`
      *,
      category:ticket_categories(id, name)
    `)
        .eq('id', ticketId)
        .single();

    return { data: data as Ticket | null, error };
}

export async function rateTicket(ticketId: string, rating: number, comment: string) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('ticket_ratings')
        .insert({
            ticket_id: ticketId,
            rating,
            comment
        });
    return { error };
}
