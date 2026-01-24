'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, Map } from 'lucide-react';

export default function RoadmapPage() {
    const [items] = useState([
        { id: '1', title: 'Mobile App', status: 'PLANNED', votes: 45, date: 'Q3 2026' },
        { id: '2', title: 'Dark Mode', status: 'IN_PROGRESS', votes: 120, date: 'Q1 2026' },
        { id: '3', title: 'Email Notifications', status: 'COMPLETED', votes: 89, date: 'Q4 2025' },
    ]);

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Map className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900">Public Roadmap</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['PLANNED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                    <div key={status} className="flex flex-col gap-4">
                        <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">
                            {status.replace('_', ' ')}
                        </h3>

                        {items.filter(i => i.status === status).map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                    <span className="text-xs text-gray-400">{item.date}</span>
                                </div>

                                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                    <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{item.votes}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>0</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
