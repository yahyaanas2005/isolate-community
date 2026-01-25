import { getInvoices } from '@/actions/billing';
import InvoiceCard from '@/components/billing/InvoiceCard';
import { DollarSign, FileText, AlertCircle } from 'lucide-react';

interface BillingPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
    const { slug } = await params;
    const { data: invoices, error } = await getInvoices(slug);

    const stats = {
        total: invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
        pending: invoices?.filter(i => i.status === 'PENDING').length || 0,
        overdue: invoices?.filter(i => i.status === 'PENDING' && new Date(i.due_date) < new Date()).length || 0,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-7 h-7 text-green-600" />
                    Billing & Payments
                </h1>
                <p className="text-sm text-gray-500">View your invoices and payment history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Due</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load invoices. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices?.map(invoice => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
            </div>

            {invoices?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No invoices found.</p>
                </div>
            )}
        </div>
    );
}
