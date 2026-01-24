'use client';

import { useState } from 'react';
import { CreditCard, FileText, DollarSign, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function BillingDashboard() {
    const [loading, setLoading] = useState(false);
    const [invoices] = useState([
        { id: '1', number: 'INV-001', amount: 50.00, status: 'PAID', date: '2025-12-01' },
        { id: '2', number: 'INV-002', amount: 50.00, status: 'ISSUED', date: '2026-01-01' },
    ]);

    const handlePay = async (invoiceId: string) => {
        try {
            setLoading(true);
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // In a real app, we would use the real invoice ID from the database.
            // For this demo, if the ID is '2', we will try to invoke the function.
            // Note: This requires a real invoice to exist in the DB with this ID.
            // Since we don't have one, this is just demonstrating the wiring.

            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: {
                    invoice_id: invoiceId,
                    return_url: window.location.href
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment initialization failed. (Note: You need real Invoice records in the DB for this to work)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Billing & Payments</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Outstanding</p>
                            <h3 className="text-2xl font-bold text-gray-900">$50.00</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Open Invoices</p>
                            <h3 className="text-2xl font-bold text-gray-900">1</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Invoice</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                                <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                                <td className="px-6 py-4 text-gray-900">${inv.amount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {inv.status !== 'PAID' && (
                                        <button
                                            onClick={() => handlePay(inv.id)}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                            Pay Online
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
