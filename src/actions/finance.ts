'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getInvoices(tenantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Fetch invoices for current user
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_no,
            title,
            amount,
            status,
            due_date,
            created_at,
            items:invoice_items(description, amount)
        `)
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id) // Only own invoices
        .order('created_at', { ascending: false });

    return { data: invoices, error };
}

export async function createInvoice(
    tenantId: string,
    data: {
        userId: string;
        title: string;
        amount: number;
        dueDate: string;
        description?: string;
    }
) {
    const supabase = await createClient();
    // Admin check needed here

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
            tenant_id: tenantId,
            user_id: data.userId,
            title: data.title,
            amount: data.amount,
            due_date: data.dueDate,
            description: data.description,
            invoice_no: `INV-${Date.now()}`, // Simple ID for MVP
            status: 'unpaid'
        })
        .select()
        .single();

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { success: true, invoice };
}

export async function recordPayment(invoiceId: string, amount: number, method: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create Payment Record (Pending Verification)
    const { error } = await supabase
        .from('payments')
        .insert({
            invoice_id: invoiceId,
            user_id: user?.id,
            amount,
            method,
            status: 'pending', // Requires admin verification
            // For MVP demo, maybe auto-verify if 'online'?
            // We'll keep it pending.
        });

    // 2. Update Invoice status to 'paid' optimistically? 
    // Usually wait for verification.

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { success: true };
}
