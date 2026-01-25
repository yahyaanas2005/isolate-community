import { NOCRequest } from '@/lib/types/noc';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface NOCCardProps {
    request: NOCRequest;
}

export default function NOCCard({ request }: NOCCardProps) {
    const statusColor = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        EXPIRED: 'bg-gray-100 text-gray-700',
    }[request.status];

    const StatusIcon = request.status === 'APPROVED' ? CheckCircle : request.status === 'REJECTED' ? XCircle : Clock;

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{request.title}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${statusColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {request.status}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{request.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <span className="px-2 py-1 bg-gray-100 rounded-full">{request.type}</span>
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>

            {request.valid_until && request.status === 'APPROVED' && (
                <div className="mt-2 text-xs text-green-600">
                    Valid until: {new Date(request.valid_until).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}
