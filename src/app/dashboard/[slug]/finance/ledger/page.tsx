'use client';

import { ArrowLeft, Download, Filter } from 'lucide-react';
import Link from 'next/link';

export default function GeneralLedgerPage({ params }: { params: { slug: string } }) {
    const entries = [
        { id: 'JE-101', date: '2026-01-20', memo: 'Monthly Landscaping Service', debit: '$2,500.00', credit: '$2,500.00', account: 'Maintenance Expense' },
        { id: 'JE-102', date: '2026-01-22', memo: 'HOA Dues Collection - Jan', debit: '$15,400.00', credit: '$15,400.00', account: 'Cash / Revenue' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${params.slug}/finance`} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">General Ledger</h1>
                        <p className="text-muted-foreground">Double-entry record of all transactions.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Ref #</th>
                            <th className="px-6 py-3">Account / Memo</th>
                            <th className="px-6 py-3 text-right">Debit</th>
                            <th className="px-6 py-3 text-right">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {entries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-gray-600">{entry.date}</td>
                                <td className="px-6 py-4 font-mono text-blue-600">{entry.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{entry.account}</div>
                                    <div className="text-xs text-gray-500">{entry.memo}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono">{entry.debit}</td>
                                <td className="px-6 py-4 text-right font-mono">{entry.credit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
