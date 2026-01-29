'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function reportViolation(
    tenantId: string,
    data: {
        type: string;
        details: string;
        offenderName?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('violations')
        .insert({
            tenant_id: tenantId,
            reported_by: user.id,
            type: data.type,
            details: data.details,
            offender_name: data.offenderName,
            status: 'reported'
        });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getDocuments(tenantId: string) {
    const supabase = await createClient();

    // Fetch public docs
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    return { data, error };
}
