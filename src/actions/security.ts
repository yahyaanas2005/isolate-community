'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { addHours, isAfter, isBefore } from 'date-fns';

export async function createVisitorPass(
    tenantId: string,
    data: {
        visitor_name: string;
        visitor_type: string; // guest, delivery, etc
        visit_type: string; // one_time
        valid_hours: number; // usually 4, 12, 24
        vehicle_no?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Generate a simple 6-digit code for MVP (or UUID)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const valid_from = new Date();
    const valid_to = addHours(valid_from, data.valid_hours || 4);

    const { error } = await supabase
        .from('visitor_passes')
        .insert({
            tenant_id: tenantId,
            invited_by: user.id,
            pass_code: code,
            visitor_name: data.visitor_name,
            visitor_type: data.visitor_type,
            visit_type: data.visit_type,
            valid_from: valid_from.toISOString(),
            valid_to: valid_to.toISOString(),
            vehicle_no: data.vehicle_no,
            status: 'active'
        });

    if (error) return { error: error.message };

    revalidatePath(`/dashboard`);
    return { success: true, code };
}

export async function getMyVisitorPasses(tenantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('invited_by', user.id)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    return { data, error };
}

// Guard Action
export async function verifyAndLogEntry(tenantId: string, passCode: string, gateId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser(); // the guard

    // 1. Find Pass
    const { data: pass, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('pass_code', passCode)
        .eq('tenant_id', tenantId)
        .single();

    if (error || !pass) return { error: 'Invalid Pass Code' };

    // 2. Validate
    const now = new Date();
    if (pass.status !== 'active') return { error: `Pass is ${pass.status}` };
    if (isAfter(now, new Date(pass.valid_to))) return { error: 'Pass Expired' };
    if (isBefore(now, new Date(pass.valid_from))) return { error: 'Pass not yet valid' };

    // 3. Log Entry
    const { error: logError } = await supabase
        .from('gate_logs')
        .insert({
            tenant_id: tenantId,
            pass_id: pass.id,
            guard_user_id: user?.id,
            gate_id: gateId, // optional
            action: 'entry',
            timestamp: now.toISOString()
        });

    // 4. Update Pass Status (if one-time)
    if (pass.visit_type === 'one_time') {
        await supabase.from('visitor_passes').update({ status: 'used' }).eq('id', pass.id);
    }

    if (logError) return { error: 'Logging failed' };

    revalidatePath(`/dashboard`);
    return { success: true, visitor: pass.visitor_name };
}
