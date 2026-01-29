'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard } from 'lucide-react';
import { recordPayment } from '@/actions/finance';
import { useRouter } from 'next/navigation';

export default function InvoiceList({ invoices }: { invoices: any[] }) {
    const router = useRouter();

    const handlePay = async (id: string, amount: number) => {
        if (!confirm('Simulate Payment? This will record a pending payment.')) return;

        await recordPayment(id, amount, 'online');
        alert('Payment Recorded! Admin will verify.');
        router.refresh();
    };

    if (invoices.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No invoices found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invoices.map((inv) => (
                <div key={inv.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <FileText className="h-6 w-6" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-semibold text-gray-900">{inv.title}</h4>
                        <div className="text-sm text-gray-500 flex flex-col md:flex-row gap-1 md:gap-4 mt-1">
                            <span>#{inv.invoice_no}</span>
                            <span>Due: {format(new Date(inv.due_date), 'MMM d, yyyy')}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                            PKR {inv.amount.toLocaleString()}
                        </div>
                        <Badge variant={inv.status === 'paid' ? 'default' : 'destructive'} className={inv.status === 'paid' ? 'bg-green-600' : ''}>
                            {inv.status}
                        </Badge>
                    </div>

                    {inv.status !== 'paid' && (
                        <div className="md:pl-4 md:border-l">
                            <Button onClick={() => handlePay(inv.id, inv.amount)}>
                                <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
