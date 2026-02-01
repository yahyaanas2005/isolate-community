'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

import { classifyTicketPriority } from '@/actions/ai';

export type ComplaintStatus = 'new' | 'acknowledged' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'reopened' | 'escalated';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export async function getComplaints(
    tenantId: string,
    filters?: {
        status?: string;
        priority?: string;
        category?: string;
        search?: string;
    },
    page: number = 1
) {
    const supabase = await createClient();
    const PAGE_SIZE = 10;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from('complaints')
        .select(`
            id,
            complaint_no,
            title,
            status,
            priority,
            created_at,
            category:complaint_categories(name),
            reporter:profiles!reported_by(full_name, avatar_url),
            assignee:profiles!assigned_to(full_name)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.category) query = query.eq('category_id', filters.category);
    if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,complaint_no.ilike.%${filters.search}%`);
    }

    const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    return { data, count, error };
}

export async function getComplaintById(id: string) {
    const supabase = await createClient();

    // Fetch details
    const { data: complaint, error } = await supabase
        .from('complaints')
        .select(`
            *,
            category:complaint_categories(id, name),
            reporter:profiles!reported_by(id, full_name, email, avatar_url, phone),
            assignee:profiles!assigned_to(id, full_name, avatar_url),
            attachments:complaint_attachments(*),
            timeline:complaint_logs(
                id, action, created_at, notes,
                actor:profiles!actor_id(full_name)
            ),
            comments:complaint_comments(
                id, comment, created_at, is_internal,
                user:profiles!user_id(full_name, avatar_url)
            ),
            feedback:complaint_feedback(*)
        `)
        .eq('id', id)
        .single();

    return { complaint, error };
}

export async function createComplaint(
    tenantId: string,
    data: {
        title: string;
        description: string;
        category_id: string;
        priority: ComplaintPriority;
        location_details?: string;
        is_emergency?: boolean;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Generate Request ID (Simple logic for MVP)
    const timestamp = Date.now().toString().slice(-6);
    const complaint_no = `CMP-${timestamp}`;

    // AI AUTO-TRIAGE
    // If priority is 'low' or not specified (user might underestimate), let AI check it.
    let finalPriority = data.priority;
    let autoTriageLog = null;

    // Only auto-triage if description is long enough to analyze
    if (data.description.length > 10) {
        const aiAnalysis = await classifyTicketPriority(data.title, data.description);
        if (aiAnalysis && aiAnalysis.priority) {
            // Upgrade priority if AI thinks it's higher
            // Mapping strings to weights could be cleaner, but simple check for now:
            const weights = { low: 1, medium: 2, high: 3, critical: 4, emergency: 5 };
            // @ts-ignore
            if (weights[aiAnalysis.priority] > weights[data.priority]) {
                // @ts-ignore
                finalPriority = aiAnalysis.priority;
                autoTriageLog = `AI Auto-Upgraded priority to ${finalPriority}: ${aiAnalysis.reason}`;
            }
        }
    }

    // Calculate SLA Deadlines
    const { data: slaRule } = await supabase
        .from('sla_rules')
        .select('response_time_hours, resolution_time_hours')
        .eq('tenant_id', tenantId)
        .eq('priority', finalPriority)
        .single();

    // Defaults: Response 24h, Resolution 72h if no rule found
    const responseHours = slaRule?.response_time_hours || 24;
    const resolutionHours = slaRule?.resolution_time_hours || 72;

    const now = new Date();
    const responseDeadline = new Date(now.getTime() + responseHours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000);

    const payload = {
        tenant_id: tenantId,
        reported_by: user.id,
        complaint_no,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        priority: finalPriority,
        location_details: data.location_details,
        is_emergency: data.is_emergency || false,
        status: 'new',
        sla_response_deadline: responseDeadline.toISOString(),
        sla_resolution_deadline: resolutionDeadline.toISOString()
    };

    const { data: result, error } = await supabase
        .from('complaints')
        .insert(payload)
        .select()
        .single();

    if (error) return { error: error.message };

    // Log creation
    await supabase.from('complaint_logs').insert({
        complaint_id: result.id,
        action: 'created',
        actor_id: user.id,
        notes: 'Complaint raised via portal'
    });

    if (autoTriageLog) {
        await supabase.from('complaint_logs').insert({
            complaint_id: result.id,
            action: 'ai_triage',
            actor_id: user.id, // Or a system bot ID
            notes: autoTriageLog
        });
    }

    revalidatePath(`/dashboard`);
    return { data: result, error: null };
}

export async function updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);

    if (error) return { error: error.message };

    // Log status change
    await supabase.from('complaint_logs').insert({
        complaint_id: id,
        action: 'status_change',
        actor_id: user?.id,
        new_value: { status },
        notes: notes || `Status updated to ${status}`
    });

    return { success: true };
}

export async function getCategories(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('complaint_categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order');
    return { data, error };
}

export async function getComplaintStats(tenantId: string) {
    const supabase = await createClient();

    // Use count queries
    const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    const { count: open } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).in('status', ['new', 'assigned', 'in_progress', 'transferred', 'reopened']);
    const { count: resolved } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'resolved');

    // Need to handle nulls if db is empty or error
    return { total: total || 0, open: open || 0, resolved: resolved || 0, critical: 0 };
}

export async function addComment(
    complaintId: string,
    comment: string,
    isInternal: boolean = false
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('complaint_comments').insert({
        complaint_id: complaintId,
        user_id: user.id,
        comment,
        is_internal: isInternal
    });

    if (error) return { error: error.message };

    // Log comment
    await supabase.from('complaint_logs').insert({
        complaint_id: complaintId,
        action: 'comment_added',
        actor_id: user.id,
        notes: isInternal ? 'Internal note added' : 'Comment added'
    });

    revalidatePath(`/dashboard`); // simplistic revalidation
    return { success: true };
}

export async function submitFeedback(
    complaintId: string,
    rating: number,
    feedback: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('complaint_feedback').insert({
        complaint_id: complaintId,
        rating,
        feedback_text: feedback,
        submitted_by: user.id
    });

    if (error) return { error: error.message };

    // Log feedback
    await supabase.from('complaint_logs').insert({
        complaint_id: complaintId,
        action: 'feedback_submitted',
        actor_id: user.id,
        notes: `Rated: ${rating}/5`
    });

    revalidatePath(`/dashboard`);
    return { success: true };
}
