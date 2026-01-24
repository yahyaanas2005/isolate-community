'use client';

import { Mail, Plus, BarChart2, Send } from 'lucide-react';
import Link from 'next/link';

export default function MarketingPage({ params }: { params: { slug: string } }) {
    const campaigns = [
        { id: 1, name: 'January Newsletter', subject: 'Happy New Year, Sunnyvale!', status: 'SENT', sentAt: 'Jan 01, 2026', stats: { openRate: '68%', clicks: 145 } },
        { id: 2, name: 'Pool Opening Announcement', subject: 'Pool opens next week', status: 'DRAFT', sentAt: '-', stats: { openRate: '-', clicks: '-' } },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
                    <p className="text-muted-foreground">Engage residents with email campaigns.</p>
                </div>
                <Link href={`/dashboard/${params.slug}/marketing/new`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> New Campaign
                </Link>
            </div>

            <div className="grid gap-6">
                {campaigns.map((c) => (
                    <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{c.name}</h3>
                                <p className="text-sm text-gray-500">Subject: {c.subject}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{c.status}</span>
                                    {c.status === 'SENT' && <span className="text-xs text-gray-400">Sent on {c.sentAt}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-right">
                            {c.status === 'SENT' ? (
                                <div className="flex gap-6">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{c.stats.openRate}</div>
                                        <div className="text-xs text-gray-500 uppercase font-medium">Open Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{c.stats.clicks}</div>
                                        <div className="text-xs text-gray-500 uppercase font-medium">Clicks</div>
                                    </div>
                                </div>
                            ) : (
                                <button className="text-blue-600 font-medium text-sm hover:underline">Edit Draft</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
