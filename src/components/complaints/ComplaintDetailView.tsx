'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, MessageSquare, History } from 'lucide-react';
import { format } from 'date-fns';
import { updateComplaintStatus, addComment, ComplaintStatus } from '@/actions/complaints';
import { cn } from '@/lib/utils';
import { ComplaintFeedback } from './ComplaintFeedback';

interface ComplaintDetailViewProps {
    complaint: any; // Type should be inferred or defined
    slug: string;
}

const STATUS_OPTIONS: ComplaintStatus[] = [
    'new', 'acknowledged', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed'
];

export default function ComplaintDetailView({ complaint, slug }: ComplaintDetailViewProps) {
    const router = useRouter();
    const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const [comment, setComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const [activeTab, setActiveTab] = useState<'comments' | 'timeline'>('comments');

    const handleStatusChange = async (newStatus: ComplaintStatus) => {
        setIsUpdating(true);
        const res = await updateComplaintStatus(complaint.id, newStatus);
        if (res.success) {
            setStatus(newStatus);
            router.refresh();
        }
        setIsUpdating(false);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsPosting(true);
        const res = await addComment(complaint.id, comment, isInternal);
        if (res.success) {
            setComment('');
            router.refresh();
        }
        setIsPosting(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{complaint.complaint_no}</h1>
                            <Badge variant="outline" className="capitalize">
                                {complaint.priority} Priority
                            </Badge>
                        </div>
                        <p className="text-gray-500">{complaint.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                        disabled={isUpdating}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt.replace('_', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description Card */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>

                        {complaint.location_details && (
                            <div className="mt-4 pt-4 border-t">
                                <h3 className="text-sm font-medium text-gray-900 mb-1">Location Details</h3>
                                <p className="text-sm text-gray-600">{complaint.location_details}</p>
                            </div>
                        )}
                    </div>

                    {/* Feedback Section (Only if Resolved/Closed) */}
                    {(status === 'resolved' || status === 'closed') && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ComplaintFeedback
                                complaintId={complaint.id}
                                existingFeedback={complaint.feedback?.[0]}
                            />
                        </div>
                    )}

                    {/* Activity Tabs */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="flex border-b bg-gray-50">
                            <button
                                className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'comments' ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                                onClick={() => setActiveTab('comments')}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Comments
                                </div>
                            </button>
                            <button
                                className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'timeline' ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                                onClick={() => setActiveTab('timeline')}
                            >
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4" /> Timeline
                                </div>
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'comments' && (
                                <div className="space-y-6">
                                    {/* Input */}
                                    <form onSubmit={handlePostComment} className="space-y-3">
                                        <textarea
                                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Write a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="internal"
                                                    checked={isInternal}
                                                    onChange={(e) => setIsInternal(e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor="internal" className="text-sm text-gray-600 cursor-pointer">Internal Note</label>
                                            </div>
                                            <Button type="submit" disabled={isPosting || !comment.trim()}>
                                                <Send className="w-4 h-4 mr-2" /> Post
                                            </Button>
                                        </div>
                                    </form>

                                    {/* List */}
                                    <div className="space-y-4">
                                        {complaint.comments?.map((c: any) => (
                                            <div key={c.id} className={cn("flex gap-3 p-4 rounded-lg", c.is_internal ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50")}>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={c.user?.avatar_url} />
                                                    <AvatarFallback>{c.user?.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-sm text-gray-900">{c.user?.full_name}</span>
                                                        <span className="text-xs text-gray-500">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{c.comment}</p>
                                                    {c.is_internal && <span className="text-[10px] text-yellow-700 font-medium uppercase tracking-wide">Internal Note</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-4 relative pl-4 border-l-2 border-gray-100">
                                    {complaint.timeline?.map((log: any) => (
                                        <div key={log.id} className="relative pl-6 pb-2">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-200 border-2 border-white" />
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-900">{log.action.replace('_', ' ')}</span>
                                                <span className="text-gray-500"> by {log.actor?.full_name || 'System'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">{format(new Date(log.created_at), 'MMM d, h:mm a')}</div>
                                            {log.notes && <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{log.notes}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta */}
                <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Ticket Info</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-sm text-gray-600">Category</span>
                                <span className="text-sm font-medium text-gray-900">{complaint.category?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-sm text-gray-600">Reported By</span>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={complaint.reporter?.avatar_url} />
                                        <AvatarFallback className="text-[10px]">{complaint.reporter?.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-900">{complaint.reporter?.full_name}</span>
                                </div>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-sm text-gray-600">Assigned To</span>
                                <div className="flex items-center gap-2">
                                    {complaint.assignee ? (
                                        <>
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={complaint.assignee?.avatar_url} />
                                                <AvatarFallback className="text-[10px]">{complaint.assignee?.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-gray-900">{complaint.assignee?.full_name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Unassigned</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="text-sm font-medium text-gray-900">{format(new Date(complaint.created_at), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {complaint.is_emergency && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-semibold">Emergency Ticket</p>
                                <p>This ticket is marked as critical priority.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
