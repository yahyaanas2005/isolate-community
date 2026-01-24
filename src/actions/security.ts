'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Visitor, PreApproval, VisitorStatus } from '@/lib/types/security';

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
                    } catch { }
                },
            },
        }
    );
}

export async function getVisitors(communityId: string, status?: VisitorStatus) {
    const supabase = await getSupabase();
    let query = supabase
        .from('visitors')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data: data as Visitor[], error };
}

export async function createPreApproval(
    communityId: string,
    data: {
        visitor_name: string;
        visitor_phone: string;
        valid_from: string;
        valid_until: string;
        purpose: string;
    }
) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('tenant_id', communityId)
        .single();

    if (!membership) return { error: 'Membership not found' };

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
        .from('pre_approvals')
        .insert({
            community_id: communityId,
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
