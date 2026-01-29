'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Notification {
    id: string; // delivery id
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    created_at: string;
    job: {
        entity_type: string;
        entity_id: string;
        kind: string;
        payload: any; // Contains title, body, link
    };
}

export async function getNotifications(tenantId: string, page: number = 1) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [], count: 0 };

    const PAGE_SIZE = 20;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Supabase join is tricky with inner join syntax if relation names aren't simple
    // schema: notification_deliveries(job_id) -> notification_jobs(id)

    const { data, count, error } = await supabase
        .from('notification_deliveries')
        .select(`
            id,
            status,
            created_at,
            job:notification_jobs (
                entity_type,
                entity_id,
                kind,
                payload
            )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .eq('channel', 'in_app')
        .order('created_at', { ascending: false })
        .range(from, to);

    // Filter by tenant? usage of notification_jobs.tenant_id
    // But filters on joined table in Supabase need specific syntax or separate filtering
    // For MVP we assume user sees all their notifications. Or we check tenant_id in payload/job.
    // The current query gets all user's notifications.

    return {
        data: data as any as Notification[],
        count,
        error
    };
}

export async function getUnreadCount(tenantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { count: 0 };

    const { count, error } = await supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('channel', 'in_app')
        .neq('status', 'read');

    return { count: count || 0, error };
}

export async function markAsRead(deliveryId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('notification_deliveries')
        .update({ status: 'read', delivered_at: new Date().toISOString() }) // abuse delivered_at as read_at or add read_at column
        .eq('id', deliveryId);

    revalidatePath('/dashboard');
    return { error };
}

export async function markAllAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
        .from('notification_deliveries')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('channel', 'in_app')
        .neq('status', 'read');

    revalidatePath('/dashboard');
    return { error };
}
