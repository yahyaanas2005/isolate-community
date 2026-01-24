import { Ticket } from '@/lib/types/helpdesk';
import { MessageSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface TicketCardProps {
    ticket: Ticket;
    basePath: string;
}

export default function TicketCard({ ticket, basePath }: TicketCardProps) {
    const statusColor = {
        OPEN: 'bg-blue-100 text-blue-700',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-700',
    }[ticket.status];

    const priorityColor = {
        LOW: 'text-gray-500',
        MEDIUM: 'text-blue-500',
        HIGH: 'text-orange-500',
        URGENT: 'text-red-500',
    }[ticket.priority];

    return (
        <Link
            href={`${basePath}/${ticket.id}`}
            className="block bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        #{ticket.id.slice(0, 8)}
                    </span>
                </div>
                <span className={`text-xs font-bold uppercase ${priorityColor}`}>
                    {ticket.priority}
                </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ticket.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                {ticket.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-3 mt-auto">
                <div className="flex items-center gap-1">
                    {ticket.category?.name || 'General'}
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                </div>
            </div>
        </Link>
    );
}
