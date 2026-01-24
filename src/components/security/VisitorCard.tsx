import { Visitor } from '@/lib/types/security';
import { User, Phone, Car, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface VisitorCardProps {
    visitor: Visitor;
}

export default function VisitorCard({ visitor }: VisitorCardProps) {
    const statusColor = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        APPROVED: 'bg-blue-100 text-blue-700',
        REJECTED: 'bg-red-100 text-red-700',
        CHECKED_IN: 'bg-green-100 text-green-700',
        CHECKED_OUT: 'bg-gray-100 text-gray-700',
    }[visitor.status];

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
                        <p className="text-sm text-gray-500">{visitor.purpose}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor}`}>
                    {visitor.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                {visitor.phone && (
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {visitor.phone}
                    </div>
                )}
                {visitor.vehicle_number && (
                    <div className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {visitor.vehicle_number}
                    </div>
                )}
                {visitor.check_in_time && (
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        In: {new Date(visitor.check_in_time).toLocaleTimeString()}
                    </div>
                )}
                {visitor.check_out_time && (
                    <div className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-gray-600" />
                        Out: {new Date(visitor.check_out_time).toLocaleTimeString()}
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(visitor.created_at).toLocaleString()}
            </div>
        </div>
    );
}
