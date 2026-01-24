'use client';

import { Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CommitteesPage({ params }: { params: { slug: string } }) {
    const committees = [
        { id: 1, name: 'Finance Committee', members: 5, nextMeeting: 'Feb 15, 2026', description: 'Oversees budget, audits, and large expenditures.' },
        { id: 2, name: 'Social & Events', members: 12, nextMeeting: 'Feb 20, 2026', description: 'Plans community gatherings and holiday parties.' },
        { id: 3, name: 'Architectural Review', members: 3, nextMeeting: 'Mar 1, 2026', description: 'Reviews renovation requests and exterior changes.' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Committees</h1>
                    <p className="text-muted-foreground">Join a board or view public meeting minutes.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {committees.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{c.name}</h3>
                        <p className="text-gray-500 mb-4 flex-1">{c.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {c.members} Members</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {c.nextMeeting}</span>
                        </div>

                        <Link href={`/dashboard/${params.slug}/committees/${c.id}`} className="w-full py-2 border border-gray-200 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50 text-gray-700">
                            View Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
