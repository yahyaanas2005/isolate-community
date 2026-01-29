'use client';

import NoticeCard from './NoticeCard';
import { Megaphone } from 'lucide-react';

export default function NoticeList({ notices }: { notices: any[] }) {
    if (!notices || notices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                <Megaphone className="h-10 w-10 mb-3 text-gray-300" />
                <p className="font-medium">No announcements yet</p>
                <p className="text-sm">Stay tuned for updates from community administration.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
            ))}
        </div>
    );
}
