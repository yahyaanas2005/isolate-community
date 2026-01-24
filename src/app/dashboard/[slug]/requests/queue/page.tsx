'use client';

import { FileText, Check, X } from 'lucide-react';

export default function RequestQueuePage({ params }: { params: { slug: string } }) {
    const queue = [
        { id: 1, user: 'John Doe (Unit 101)', type: 'Move-In NOC', date: '5h ago', status: 'IN_REVIEW' },
        { id: 2, user: 'Alice Smith (Unit 504)', type: 'Renovation Permit', date: '1d ago', status: 'SUBMITTED' },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Request Queue</h1>
                    <p className="text-muted-foreground">Approvals pending your review.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {queue.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{item.type}</h3>
                                <p className="text-sm text-gray-600">{item.user}</p>
                                <p className="text-xs text-gray-400 mt-1">Submitted {item.date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-green-100 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 font-medium transition-colors">
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-red-100 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 font-medium transition-colors">
                                <X className="w-4 h-4" /> Reject
                            </button>
                            <button className="px-4 py-2 text-gray-500 hover:text-gray-900 font-medium">
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
