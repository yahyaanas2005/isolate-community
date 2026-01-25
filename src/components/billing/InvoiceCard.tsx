import { Invoice } from '@/lib/types/billing';
import { DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface InvoiceCardProps {
    invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
    const statusColor = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        PAID: 'bg-green-100 text-green-700',
        OVERDUE: 'bg-red-100 text-red-700',
        CANCELLED: 'bg-gray-100 text-gray-700',
    }[invoice.status];

    const isOverdue = invoice.status === 'PENDING' && new Date(invoice.due_date) < new Date();

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">Invoice #{invoice.invoice_number}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {invoice.line_items?.length || 0} item(s)
                    </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor}`}>
                    {invoice.status}
                </span>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                    <DollarSign className="w-5 h-5" />
                    {invoice.amount.toLocaleString()}
                </div>
                {isOverdue && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                <Calendar className="w-3 h-3" />
                Due: {new Date(invoice.due_date).toLocaleDateString()}
            </div>

            {invoice.status === 'PENDING' && (
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Pay Now
                </button>
            )}
        </div>
    );
}
