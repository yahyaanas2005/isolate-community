'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Initial count
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_user_id', user.id)
                .eq('is_read', false);

            setUnreadCount(count || 0);

            // Realtime subscription
            const channel = supabase
                .channel('notifications_bell')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setUnreadCount((prev) => prev + 1);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        // Refetch on updates (e.g. read status change)
                        fetchUnreadCount();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchUnreadCount();
    }, []);

    return (
        <Link href="/dashboard/notifications" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
