import { Violation } from '@/lib/types/violations';
import { AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface ViolationCardProps {
    violation: Violation;
}

export default function ViolationCard({ violation }: ViolationCardProps) {
    const severityColor = {
        LOW: 'bg-blue-100 text-blue-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        HIGH: 'bg-orange-100 text-orange-700',
        CRITICAL: 'bg-red-100 text-red-700',
    }[violation.severity];

    const statusColor = {
        REPORTED: 'bg-gray-100 text-gray-700',
        UNDER_REVIEW: 'bg-blue-100 text-blue-700',
        CONFIRMED: 'bg-orange-100 text-orange-700',
        RESOLVED: 'bg-green-100 text-green-700',
        DISMISSED: 'bg-gray-100 text-gray-500',
    }[violation.status];

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">{violation.type}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${severityColor}`}>
                    {violation.severity}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{violation.description}</p>

            <div className="flex items-center justify-between pt-3 border-t">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor}`}>
                    {violation.status.replace('_', ' ')}
                </span>
                {violation.fine_amount && (
                    <div className="flex items-center gap-1 text-red-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {violation.fine_amount}
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-400 mt-2">
                {new Date(violation.created_at).toLocaleDateString()}
            </div>
        </div>
    );
}
