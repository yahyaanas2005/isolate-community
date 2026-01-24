'use client';

import { AlertTriangle, Plus, Filter, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ViolationsPage({ params }: { params: { slug: string } }) {
    const violations = [
        { id: 1, type: 'Noise Complaint', location: 'Unit 402', reportedBy: 'John D.', status: 'OPEN', severity: 'MEDIUM', date: '2h ago' },
        { id: 2, type: 'Improper Parking', location: 'Visitor Spot 4', reportedBy: 'Guard', status: 'RESOLVED', severity: 'LOW', date: '1d ago' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Violations & Issues</h1>
                    <p className="text-muted-foreground">Report and track community rule violations.</p>
                </div>
                <Link href={`/dashboard/${params.slug}/violations/new`} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                    <AlertTriangle className="w-5 h-5" /> Report Issue
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Issue</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Severity</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {violations.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{v.type}</td>
                                <td className="px-6 py-4 text-gray-500">{v.location}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${v.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                                            v.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {v.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${v.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                                            v.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {v.status === 'OPEN' ? <AlertCircle className="w-3 h-3" /> : null}
                                        {v.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{v.date}</td>
                                <td className="px-6 py-4">
                                    <Link href={`/dashboard/${params.slug}/violations/${v.id}`} className="text-blue-600 hover:underline font-medium">
                                        Manage
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
