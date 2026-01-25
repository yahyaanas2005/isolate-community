'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/lib/types/helpdesk';

export async function getTickets(communitySlug: string, status?: TicketStatus): Promise<{ data: Ticket[] | null; error: any }> {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    let query = supabase
        .from('tickets')
        .select(`
            *,
            category:ticket_categories(id, name)
        `)
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data: data as Ticket[], error };
}

export async function getTicketCategories(communitySlug: string): Promise<{ data: TicketCategory[] | null; error: any }> {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('community_id', tenant.id);

    return { data: data as TicketCategory[], error };
}

export async function createTicket(
    communitySlug: string,
    data: {
        title: string;
        description: string;
        category_id?: string;
        priority: TicketPriority;
        tower?: string;
        unit_id?: string;
    }
) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('tickets')
        .insert({
            community_id: tenant.id,
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
