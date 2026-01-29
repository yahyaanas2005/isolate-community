'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { markAllAsRead, Notification, markAsRead } from '@/actions/notifications';
import { CheckCheck, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationCenter({ initialNotifications }: { initialNotifications: Notification[] }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);
    const [loading, setLoading] = useState(false);

    const handleMarkAllRead = async () => {
        setLoading(true);
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
        router.refresh(); // Update bell count
        setLoading(false);
    };

    const handleItemClick = async (n: Notification) => {
        if (n.status !== 'read') {
            await markAsRead(n.id);
            // Optimistic update
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, status: 'read' } : item));
            router.refresh();
        }

        // Navigation if payload has url
        if (n.job.payload?.url) {
            router.push(n.job.payload.url);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5" /> All Notifications
                </h2>
                <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={loading || notifications.every(n => n.status === 'read')}>
                    <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        No notifications found.
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${n.status !== 'read' ? 'bg-blue-50/50' : ''}`}
                                onClick={() => handleItemClick(n)}
                            >
                                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${n.status !== 'read' ? 'bg-blue-600' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm ${n.status !== 'read' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {n.job.payload?.title || 'Notification'}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {format(new Date(n.created_at), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{n.job.payload?.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
