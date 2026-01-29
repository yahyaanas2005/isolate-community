'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, AlertTriangle, Calendar, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NoticeCard({ notice }: { notice: any }) {
    const isEmergency = notice.priority === 'emergency' || notice.priority === 'urgent';
    const isHigh = notice.priority === 'high';

    return (
        <div className={cn(
            "rounded-xl border shadow-sm transition-all hover:shadow-md overflow-hidden bg-white",
            isEmergency ? "border-red-200 ring-1 ring-red-100" : "border-gray-200"
        )}>
            {/* Header / Banner */}
            {(isEmergency || isHigh) && (
                <div className={cn(
                    "px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                    isEmergency ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                )}>
                    <AlertTriangle className="h-3 w-3" />
                    {notice.priority} Alert
                </div>
            )}

            <div className="p-5 space-y-4">
                {/* Meta Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={notice.author?.avatar_url} />
                            <AvatarFallback>{notice.author?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{notice.author?.full_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                {format(new Date(notice.created_at), 'MMM d, h:mm a')}
                                {notice.category && (
                                    <>
                                        <span>•</span>
                                        <span className="text-blue-600">{notice.category.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {notice.pinned && <Pin className="h-4 w-4 text-blue-500 rotate-45 fill-blue-50" />}
                        {notice.title}
                    </h3>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {notice.body}
                    </div>
                </div>
            </div>
        </div>
    );
}
