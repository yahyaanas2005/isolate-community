import { getInvoices } from '@/actions/finance';
import InvoiceList from '@/components/finance/InvoiceList';
import { createClient } from '@/utils/supabase/server';
import { CircleDollarSign } from 'lucide-react';

interface FinancePageProps {
    params: Promise<{ slug: string }>;
}

export default async function FinancePage({ params }: FinancePageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    const { data: invoices } = await getInvoices(tenantId);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CircleDollarSign className="w-7 h-7 text-indigo-600" />
                    Billing & Finance
                </h1>
                <p className="text-sm text-gray-500">View and pay your community invoices.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
                <h2 className="text-lg font-semibold mb-4">My Invoices</h2>
                <InvoiceList invoices={invoices || []} />
            </div>
        </div>
    );
}
