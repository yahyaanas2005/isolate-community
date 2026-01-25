'use server';

import { getSupabase, getMembershipBySlug, getTenantBySlug } from './shared';
import { Visitor, PreApproval, VisitorStatus } from '@/lib/types/security';

export async function getVisitors(communitySlug: string, status?: VisitorStatus) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    let query = supabase
        .from('visitors')
        .select('*')
        .eq('community_id', tenant.id)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data: data as Visitor[], error };
}

export async function createPreApproval(
    communitySlug: string,
    data: {
        visitor_name: string;
        visitor_phone: string;
        valid_from: string;
        valid_until: string;
        purpose: string;
    }
) {
    const { user, membership, tenant, error: authError } = await getMembershipBySlug(communitySlug);

    if (authError || !membership || !tenant) {
        return { error: authError || 'Membership not found' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const supabase = await getSupabase();
    const { error } = await supabase
        .from('pre_approvals')
        .insert({
            community_id: tenant.id,
            created_by: membership.id,
            visitor_name: data.visitor_name,
            visitor_phone: data.visitor_phone,
            valid_from: data.valid_from,
            valid_until: data.valid_until,
            purpose: data.purpose,
            otp_code: otp
        });

    return { error, otp };
}

export async function updateVisitorStatus(visitorId: string, status: VisitorStatus) {
    const supabase = await getSupabase();
    const updateData: any = { status };

    if (status === 'CHECKED_IN') {
        updateData.check_in_time = new Date().toISOString();
    } else if (status === 'CHECKED_OUT') {
        updateData.check_out_time = new Date().toISOString();
    }

    const { error } = await supabase
        .from('visitors')
        .update(updateData)
        .eq('id', visitorId);

    return { error };
}
