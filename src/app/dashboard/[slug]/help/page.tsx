'use client';

import { LifeBuoy, Plus, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HelpBoardPage({ params }: { params: { slug: string } }) {
    const tickets = [
        { id: 1, title: 'Leaking tap in gym', category: 'Maintenance', status: 'OPEN', priority: 'MEDIUM', date: '2h ago' },
        { id: 2, title: 'Incorrect billing charge', category: 'Billing', status: 'RESOLVED', priority: 'HIGH', date: '3d ago' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Help Board</h1>
                    <p className="text-muted-foreground">Submit support tickets and track resolution.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> New Ticket
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Topic</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Priority</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tickets.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900">{t.title}</td>
                                <td className="px-6 py-4 text-gray-500">{t.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{t.priority}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {t.status === 'RESOLVED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{t.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
