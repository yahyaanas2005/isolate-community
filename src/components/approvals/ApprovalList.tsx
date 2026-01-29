'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalItem, approveItem } from '@/actions/approvals';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Clock, FileText, UserPlus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ApprovalList({ initialItems, tenantId }: { initialItems: ApprovalItem[]; tenantId: string }) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (item: ApprovalItem, approved: boolean) => {
        setProcessing(item.id);
        const { error } = await approveItem(tenantId, item.id, item.type, approved);

        if (!error) {
            setItems(prev => prev.filter(i => i.id !== item.id));
            router.refresh(); // Update other counts potentially
        } else {
            alert('Failed to process request: ' + error); // Simple alert for MVP
        }
        setProcessing(null);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="text-gray-500">No pending requests requiring your approval.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center gap-5 transition-shadow hover:shadow-md">
                    <div className="shrink-0">
                        {item.type === 'membership' ? (
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <UserPlus className="h-5 w-5" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <FileText className="h-5 w-5" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={item.requester.avatar} />
                                <AvatarFallback className="text-[10px]">{item.requester.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-gray-700">{item.requester.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:border-l md:pl-5 shrink-0">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-24 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            onClick={() => handleAction(item, false)}
                            disabled={!!processing}
                        >
                            <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button
                            className="w-24"
                            size="sm"
                            onClick={() => handleAction(item, true)}
                            disabled={!!processing}
                        >
                            {processing === item.id ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
