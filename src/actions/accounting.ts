'use server';

import { getSupabase, getTenantBySlug } from './shared';
import { GLEntry, Budget } from '@/lib/types/accounting';

export async function getGLEntries(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('general_ledger')
        .select('*')
        .eq('community_id', tenant.id)
        .order('transaction_date', { ascending: false })
        .limit(50);

    return { data: data as GLEntry[], error };
}

export async function getBudgets(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: [], error: 'Community not found' };

    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('community_id', tenant.id);

    return { data: data as Budget[], error };
}

export async function getAccountingSummary(communitySlug: string) {
    const supabase = await getSupabase();
    const tenant = await getTenantBySlug(communitySlug);
    if (!tenant) return { data: null, error: 'Community not found' };

    const { data: entries } = await supabase
        .from('general_ledger')
        .select('debit, credit')
        .eq('community_id', tenant.id);

    const total_income = entries?.reduce((sum, e) => sum + (e.credit || 0), 0) || 0;
    const total_expenses = entries?.reduce((sum, e) => sum + (e.debit || 0), 0) || 0;

    return {
        data: {
            total_income,
            total_expenses,
            net_balance: total_income - total_expenses,
            period: new Date().toISOString().slice(0, 7)
        },
        error: null
    };
}
