'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GLEntry, Budget } from '@/lib/types/accounting';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );
}

export async function getGLEntries(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('general_ledger')
        .select('*')
        .eq('community_id', communityId)
        .order('transaction_date', { ascending: false })
        .limit(50);

    return { data: data as GLEntry[], error };
}

export async function getBudgets(communityId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('community_id', communityId);

    return { data: data as Budget[], error };
}

export async function getAccountingSummary(communityId: string) {
    const supabase = await getSupabase();

    const { data: entries } = await supabase
        .from('general_ledger')
        .select('debit, credit')
        .eq('community_id', communityId);

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
