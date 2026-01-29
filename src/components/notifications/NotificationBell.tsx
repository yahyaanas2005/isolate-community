'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getUnreadCount, getNotifications, Notification, markAsRead } from '@/actions/notifications';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell({ tenantId, initialCount = 0 }: { tenantId: string; initialCount: number }) {
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Simple polling every minute
        const interval = setInterval(async () => {
            const { count: newCount } = await getUnreadCount(tenantId);
            setCount(newCount);
        }, 60000);
        return () => clearInterval(interval);
    }, [tenantId]);

    const handleOpen = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            const { data } = await getNotifications(tenantId, 1);
            setNotifications(data || []);
        }
    };

    const handleClick = async (n: Notification) => {
        if (n.status !== 'read') {
            await markAsRead(n.id);
            setCount(c => Math.max(0, c - 1));
        }
        setOpen(false);
        // Navigate based on payload
        // Assume payload has 'url' or construct from entity type
        const url = n.job.payload?.url || `/dashboard/${tenantId}/notifications`;
        router.push(url);
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {count > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {count > 0 && <span className="text-xs font-normal text-muted-foreground">{count} unread</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                        notifications.map(n => (
                            <DropdownMenuItem key={n.id} className="cursor-pointer flex flex-col items-start gap-1 p-3" onClick={() => handleClick(n)}>
                                <div className="flex justify-between w-full">
                                    <span className={`text-sm font-medium ${n.status === 'read' ? 'text-gray-600' : 'text-gray-900'}`}>
                                        {n.job.payload?.title || 'Notification'}
                                    </span>
                                    {n.status !== 'read' && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-2">{n.job.payload?.body}</span>
                                <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-blue-600 font-medium" onClick={() => router.push(`/dashboard/${tenantId}/notifications`)}>
                    View All
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
