'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logAudit(
    tenantId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: any = {}
) {
    // Fire and forget (don't block the UI)
    // BUT in Vercel/stateless envs, await is safer to ensure it completes.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Should audit unauthenticated actions? Maybe, but tricky via this helper.

    try {
        await supabase.from('audit_logs').insert({
            tenant_id: tenantId,
            actor_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
            // ip_address could be tricky to get here without headers
        });
    } catch (e) {
        console.error('Failed to log audit:', e);
    }
}

export async function getAuditLogs(
    tenantId: string,
    filters?: {
        actorId?: string;
        action?: string;
        entityType?: string;
        startDate?: string;
        endDate?: string;
    },
    page: number = 1
) {
    const supabase = await createClient();
    const PAGE_SIZE = 20;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from('audit_logs')
        .select(`
            id,
            action,
            entity_type,
            entity_id,
            details,
            created_at,
            actor:profiles!actor_id(full_name, email, avatar_url)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (filters?.actorId) query = query.eq('actor_id', filters.actorId);
    if (filters?.action) query = query.ilike('action', `%${filters.action}%`);
    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    return { data, count, error };
}
