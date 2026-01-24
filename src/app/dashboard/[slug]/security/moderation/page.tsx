'use client';

import { useState } from 'react';

export default function ModerationPage({ params }: { params: { slug: string } }) {
    const [reports] = useState([
        { id: 1, type: 'POST', reason: 'SPAM', description: 'Duplicate listing for selling iphone', reporter: 'Alice', status: 'PENDING' },
        { id: 2, type: 'COMMENT', reason: 'HARASSMENT', description: 'Rude comment on parking thread', reporter: 'Bob', status: 'REVIEWING' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
                    <p className="text-muted-foreground">Review and manage reported content.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Pending: 1
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Resolved: 24
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Report ID</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Reason</th>
                            <th className="px-6 py-3 font-medium">Description</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-900">#{report.id}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-red-600 font-medium">{report.reason}</td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{report.description}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                                        <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No active reports. Good job!
                    </div>
                )}
            </div>
        </div>
    );
}
