'use client';

import { Bell, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
    const [notifications] = useState([
        { id: 1, title: 'Welcome to Sunnyvale Heights', body: 'We are glad to have you here!', time: '2 hours ago', unread: true },
        { id: 2, title: 'Gate Access Granted', body: 'Visitor Mike Ross checked in.', time: '5 hours ago', unread: false },
        { id: 3, title: 'New Event: Community BBQ', body: 'Don\'t miss out on the fun this Saturday.', time: '1 day ago', unread: false },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated with community alerts.</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Mark all as read
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {notifications.map((n) => (
                        <div key={n.id} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-blue-50/50' : ''}`}>
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-semibold ${n.unread ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h4>
                                    <span className="text-xs text-gray-500">{n.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{n.body}</p>
                            </div>
                            {n.unread && (
                                <button className="self-center text-blue-600 hover:text-blue-800" title="Mark read">
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {notifications.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No notifications yet.
                    </div>
                )}
            </div>
        </div>
    );
}
