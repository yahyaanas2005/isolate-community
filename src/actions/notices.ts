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
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
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
            status: 'published', // Auto publish for MVP
            published_at: new Date().toISOString(),
            published_by: user.id
        });

    if (error) return { error: error.message };

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
    revalidatePath(`/dashboard`);
    return { success: true };
}
