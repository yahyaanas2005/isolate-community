'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, AlertTriangle, Pin, Calendar, Clock, X } from 'lucide-react';
import { createNotice, NoticeType, NoticePriority } from '@/actions/notices';
import { useRouter } from 'next/navigation';
import { TargetAudienceSelector } from './TargetAudienceSelector';

export default function CreateNoticeDialog({ tenantId, categories }: { tenantId: string; categories: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [targeting, setTargeting] = useState<any>(null);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState<NoticeType>('general');
    const [priority, setPriority] = useState<NoticePriority>('normal');
    const [categoryId, setCategoryId] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [scheduleMode, setScheduleMode] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createNotice(tenantId, {
            title,
            body,
            type: targeting ? 'targeted' : 'general',
            priority,
            category_id: categoryId || undefined,
            is_pinned: isPinned,

            targeting,
            starts_at: startsAt || undefined,
            ends_at: endsAt || undefined
        });

        if (res.success) {
            setOpen(false);
            setTitle('');
            setBody('');
            setType('general');
            setPriority('normal');
            setIsPinned(false);

            setCategoryId('');
            setStartsAt('');
            setEndsAt('');
            setScheduleMode(false);
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Megaphone className="mr-2 h-4 w-4" /> Publish Notice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Publish New Announcement</DialogTitle>
                    <DialogDescription>
                        Share updates, alerts, or events with the community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Headline</label>
                        <Input
                            required
                            placeholder="e.g. Annual Meeting Scheduled"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">General</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as NoticePriority)}
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Write your announcement here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <TargetAudienceSelector onChange={setTargeting} />
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                Publishing Schedule
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setScheduleMode(!scheduleMode)}
                                className={scheduleMode ? "text-blue-600 bg-blue-50" : "text-gray-500"}
                            >
                                {scheduleMode ? 'Cancel Schedule' : 'Set Schedule'}
                            </Button>
                        </div>

                        {scheduleMode && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Publish At</span>
                                    <Input
                                        type="datetime-local"
                                        value={startsAt}
                                        onChange={(e) => setStartsAt(e.target.value)}
                                        className="text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400">Leave empty for "Now"</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Expire At</span>
                                    <Input
                                        type="datetime-local"
                                        value={endsAt}
                                        onChange={(e) => setEndsAt(e.target.value)}
                                        className="text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400">Optional auto-archive</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="pinned"
                                className="rounded border-gray-300"
                                checked={isPinned}
                                onChange={(e) => setIsPinned(e.target.checked)}
                            />
                            <label htmlFor="pinned" className="text-sm font-medium flex items-center gap-1">
                                <Pin className="h-3 w-3" /> Pin to top
                            </label>
                        </div>

                        {priority === 'emergency' && (
                            <div className="text-xs text-red-600 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded">
                                <AlertTriangle className="h-3 w-3" />
                                Will trigger push notification
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className={priority === 'emergency' ? 'bg-red-600 hover:bg-red-700' : ''}>
                            {loading ? 'Publishing...' : 'Publish'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
