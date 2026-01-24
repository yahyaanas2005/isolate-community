'use client';

import { ArrowLeft, CheckCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage({ params }: { params: { slug: string } }) {
    const pos = [
        { id: 'PO-2024-001', vendor: 'Green Thumb Landscaping', amount: '$2,500.00', status: 'APPROVED', date: 'Jan 15, 2026' },
        { id: 'PO-2024-002', vendor: 'Ace Hardware', amount: '$450.00', status: 'PENDING', date: 'Jan 22, 2026' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${params.slug}/finance`} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Purchase Orders</h1>
                        <p className="text-muted-foreground">Manage vendor procurement and approvals.</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> New PO
                </button>
            </div>

            <div className="grid gap-4">
                {pos.map((po) => (
                    <div key={po.id} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-blue-600 font-bold">{po.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${po.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {po.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900">{po.vendor}</h3>
                            <p className="text-xs text-gray-500">{po.date}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">{po.amount}</div>
                            <button className="text-sm text-blue-600 font-medium hover:underline mt-1">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
