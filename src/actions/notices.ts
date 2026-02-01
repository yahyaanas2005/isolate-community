'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type NoticeType = 'general' | 'targeted' | 'restricted' | 'emergency';
export type NoticePriority = 'normal' | 'high' | 'urgent' | 'emergency';
export type BodyFormat = 'html' | 'markdown' | 'plain';

export async function getNotices(
    tenantId: string,
    filters?: {
        type?: string;
        search?: string;
    },
    page: number = 1
) {
    const supabase = await createClient();
    const PAGE_SIZE = 10;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from('announcements')
        .select(`
            id,
            title,
            body,
            type,
            priority,
            created_at,
            starts_at,
            category:announcement_categories(name, color, icon),
            author:profiles!created_by(full_name, avatar_url)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    // Filter by published status or user's own drafts
    // For MVP simplification, we just show all if role check isn't implemented strictly yet
    // But ideally: status = 'published'
    query = query.in('status', ['published', 'scheduled']);

    // Filter for Active Notices (Started and Not Expired)
    // Note: Supabase NOW() comparison might be better done in DB, but simple filter helps
    const now = new Date().toISOString();
    query = query.or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gt.${now}`);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, count, error } = await query.range(from, to);

    return { data, count, error };
}

export async function getNoticeCategories(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('announcement_categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order');
    return { data, error };
}

export async function createNotice(
    tenantId: string,
    data: {
        title: string;
        body: string;
        type: NoticeType;
        priority: NoticePriority;
        category_id?: string;
        is_pinned?: boolean;
        targeting?: any;
        starts_at?: string;
        ends_at?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { data: notice, error } = await supabase
        .from('announcements')
        .insert({
            tenant_id: tenantId,
            created_by: user.id,
            title: data.title,
            body: data.body,
            type: data.type,
            priority: data.priority,
            category_id: data.category_id,
            pinned: data.is_pinned || false,
            status: data.starts_at && new Date(data.starts_at) > new Date() ? 'scheduled' : 'published',
            published_at: data.starts_at && new Date(data.starts_at) > new Date() ? null : new Date().toISOString(),
            starts_at: data.starts_at || new Date().toISOString(),
            ends_at: data.ends_at,
            published_by: user.id
        })
        .select()
        .single();

    if (error) return { error: error.message };

    // Insert Targeting Rules if provided
    if (data.targeting) {
        const { error: targetError } = await supabase
            .from('announcement_target_rules')
            .insert({
                announcement_id: notice.id,
                rules: data.targeting,
                mode: 'dynamic'
            });

        if (targetError) console.error('Error saving target rules:', targetError);
    }

    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function deleteNotice(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('announcements')
        .update({ status: 'deleted', deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function markNoticeAsRead(noticeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notice_reads').upsert({
        notice_id: noticeId,
        user_id: user.id,
        read_at: new Date().toISOString()
    }, { onConflict: 'notice_id,user_id' });

    revalidatePath(`/dashboard`);
}

export async function addNoticeComment(noticeId: string, comment: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('notice_comments').insert({
        notice_id: noticeId,
        user_id: user.id,
        comment
    });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getNoticeComments(noticeId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('notice_comments')
        .select(`
            id, comment, created_at,
            user:profiles!user_id(full_name, avatar_url)
        `)
        .eq('notice_id', noticeId)
        .order('created_at', { ascending: true });

    return { data, error };
}

