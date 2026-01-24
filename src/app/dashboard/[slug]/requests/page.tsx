'use client';

import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RequestsPage({ params }: { params: { slug: string } }) {
    const requests = [
        { id: 1, type: 'Move-In NOC', date: '2024-01-20', status: 'APPROVED', fee: '$50.00' },
        { id: 2, type: 'Renovation Permit', date: '2024-01-22', status: 'IN_REVIEW', fee: '$0.00' },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
                    <p className="text-muted-foreground">Manage your permits, NOCs, and service requests.</p>
                </div>
                <Link href={`/dashboard/${params.slug}/requests/new`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> New Request
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Submitted On</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Fee</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.type}</td>
                                    <td className="px-6 py-4 text-gray-500">{req.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                req.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {req.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> :
                                                req.status === 'IN_REVIEW' ? <Clock className="w-3 h-3" /> : null}
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{req.fee}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {requests.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        No requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
