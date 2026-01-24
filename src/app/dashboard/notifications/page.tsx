'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications_page')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => fetchNotifications()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setNotifications(data as Notification[]);
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);

        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        await supabase.rpc('mark_notifications_read', { p_notification_ids: unreadIds });
        fetchNotifications();
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 text-black">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={notifications.every(n => n.is_read)}
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500">You don't have any notifications yet.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`group relative p-4 rounded-xl border transition-all ${notification.is_read
                                    ? 'bg-white border-gray-100'
                                    : 'bg-blue-50 border-blue-100 shadow-sm'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-blue-600'}`} />

                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className={`font-medium ${notification.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {notification.body && (
                                        <p className={`mt-1 text-sm ${notification.is_read ? 'text-gray-600' : 'text-blue-800/80'}`}>
                                            {notification.body}
                                        </p>
                                    )}

                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Check className="w-3 h-3" />
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
