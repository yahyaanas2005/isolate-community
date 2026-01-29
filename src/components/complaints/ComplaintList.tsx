'use client';

import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { ComplaintStatus, ComplaintPriority } from '@/actions/complaints';

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    escalated: 'bg-red-100 text-red-800',
};

const PRIORITY_ICONS: Record<string, any> = {
    low: <div className="h-2 w-2 rounded-full bg-green-500" />,
    medium: <div className="h-2 w-2 rounded-full bg-blue-500" />,
    high: <div className="h-2 w-2 rounded-full bg-orange-500" />,
    critical: <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />,
};

interface Complaint {
    id: string;
    complaint_no: string;
    title: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    created_at: string;
    category: { name: string } | null;
    reporter: { full_name: string; avatar_url?: string } | null;
    assignee: { full_name: string } | null;
}

export default function ComplaintList({
    complaints,
    slug
}: {
    complaints: Complaint[];
    slug: string;
}) {
    const router = useRouter();

    return (
        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>ID</TableHead>
                        <TableHead>Issue Details</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {complaints.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-gray-300" />
                                    No complaints found.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        complaints.map((complaint) => (
                            <TableRow key={complaint.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/helpdesk/${complaint.id}`)}>
                                <TableCell className="font-mono text-xs font-medium text-gray-500">
                                    {complaint.complaint_no}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900 line-clamp-1">{complaint.title}</div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                            {complaint.category?.name || 'General'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 capitalize text-sm">
                                        {PRIORITY_ICONS[complaint.priority] || PRIORITY_ICONS.medium}
                                        {complaint.priority}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`capitalize border-none shadow-none font-normal ${STATUS_COLORS[complaint.status] || 'bg-gray-100'}`}>
                                        {complaint.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={complaint.reporter?.avatar_url} />
                                            <AvatarFallback className="text-[10px]">{complaint.reporter?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-gray-600 line-clamp-1">{complaint.reporter?.full_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">
                                    <div className="flex items-center gap-1" title={new Date(complaint.created_at).toLocaleString()}>
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
