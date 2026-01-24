'use client';

import { Calendar, FileText, CheckSquare, Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default function CommitteeDetailPage({ params }: { params: { slug: string; committeeId: string } }) {
    const committee = { name: 'Finance Committee', chair: 'Alice Freeman' };
    const meetings = [
        { id: 1, title: 'Q1 Budget Review', date: 'Feb 15, 2026', status: 'SCHEDULED' },
        { id: 2, title: 'Jan 2026 Monthly Sync', date: 'Jan 15, 2026', status: 'COMPLETED' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{committee.name}</h1>
                    <p className="text-gray-500">Chair: {committee.chair}</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Schedule Meeting
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main: Meetings */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Meetings & Minutes
                    </h2>
                    <div className="bg-white rounded-xl border border-gray-200 divide-y">
                        {meetings.map((m) => (
                            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-900">{m.title}</h3>
                                    <p className="text-sm text-gray-500">{m.date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{m.status}</span>
                                    <Link href={`/dashboard/${params.slug}/meetings/${m.id}`} className="text-sm text-blue-600 hover:underline">
                                        {m.status === 'COMPLETED' ? 'View Minutes' : 'View Agenda'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Members</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between"><span>Alice Freeman</span> <span className="text-gray-400">Chair</span></li>
                            <li className="flex justify-between"><span>Bob Smith</span> <span className="text-gray-400">Secretary</span></li>
                            <li className="flex justify-between"><span>Charlie Day</span> <span className="text-gray-400">Member</span></li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Latest Docs</h3>
                        <ul className="space-y-3 text-sm text-blue-600">
                            <li><a href="#" className="hover:underline">2026 Budget Draft.pdf</a></li>
                            <li><a href="#" className="hover:underline">Audit Report 2025.pdf</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
