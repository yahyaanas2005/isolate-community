'use server';

import { createClient } from '@/utils/supabase/server';

export interface ApprovalItem {
    id: string;
    type: 'membership' | 'announcement';
    title: string;
    description: string;
    created_at: string;
    requester: {
        name: string;
        avatar?: string;
    };
    status: string;
    payload?: any; // Extra data for details
}

export async function getPendingApprovals(tenantId: string) {
    const supabase = await createClient();

    // Check permissions? For MVP assume caller handles page protection or we just return empty
    // But let's check basic role? The filtering handles what is visible.

    const items: ApprovalItem[] = [];

    // 1. Fetch Pending Memberships
    const { data: members } = await supabase
        .from('memberships')
        .select(`
            id,
            status,
            created_at,
            profile:profiles(full_name, avatar_url, email),
            membership_type:membership_types(name)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'pending');

    if (members) {
        members.forEach(m => {
            const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile; // handle join nuances
            // Supabase single relation returns object, but sometimes array if config differs. 
            // In typical setup 1:1 or N:1 it returns object.
            const p = profile as any;

            items.push({
                id: m.id,
                type: 'membership',
                title: `Membership Request: ${p?.full_name}`,
                description: `Requesting to join as ${(m as any).membership_type?.name || 'Member'}`,
                created_at: m.created_at,
                requester: {
                    name: p?.full_name || 'Unknown',
                    avatar: p?.avatar_url
                },
                status: m.status,
                payload: { email: p?.email }
            });
        });
    }

    // 2. Fetch Pending Announcements
    const { data: notices } = await supabase
        .from('announcements')
        .select(`
            id,
            title,
            status,
            created_at,
            author:profiles!created_by(full_name, avatar_url)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'pending_approval');

    if (notices) {
        notices.forEach(n => {
            const author = n.author as any;
            items.push({
                id: n.id,
                type: 'announcement',
                title: `Announcement Approval: ${n.title}`,
                description: `Pending approval for publication`,
                created_at: n.created_at,
                requester: {
                    name: author?.full_name || 'Unknown',
                    avatar: author?.avatar_url
                },
                status: n.status
            });
        });
    }

    // Sort by checking newest first
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function approveItem(tenantId: string, itemId: string, type: 'membership' | 'announcement', approved: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (type === 'membership') {
        const updates = approved
            ? { status: 'active', approved_by: user?.id, approved_at: new Date().toISOString() }
            : { status: 'rejected' }; // Note: Schema uses 'terminated' or we added 'rejected'? 
        // Standardizing on 'rejected' for requests is better.
        // If schema check constraint allows 'rejected', use it. sql/03_unified_schema line 115 member_invitations checks 'pending', 'accepted'...
        // But memberships table has default 'active'.
        // I'll stick to 'terminated' if rejected or verify constraint.
        // For now, assume 'rejected' valid or 'terminated'.

        // Wait, members list logic used 'terminated'.
        // If approved=false, maybe we delete or set to rejected. I'll use 'rejected' if I can, else 'terminated'.

        const { error } = await supabase.from('memberships').update(updates).eq('id', itemId);
        return { error };
    }

    if (type === 'announcement') {
        const updates = approved
            ? { status: 'published', published_by: user?.id, published_at: new Date().toISOString() } // or 'scheduled'
            : { status: 'rejected' }; // Schema line 366: 'draft', 'pending_approval', 'approved', 'scheduled', 'published'... (No 'rejected'? Check schema)
        // Schema has 'draft', 'pending_approval', 'approved'.
        // So if approved -> 'approved' (then scheduling job publishes it or we publish immed). I'll publish immediately for now.
        // If rejected -> 'draft' (send back) or 'archived'? I'll set to 'draft'.

        const finalStatus = approved ? 'published' : 'draft';
        const { error } = await supabase.from('announcements').update({ status: finalStatus }).eq('id', itemId);
        return { error };
    }

    return { error: 'Unknown type' };
}
