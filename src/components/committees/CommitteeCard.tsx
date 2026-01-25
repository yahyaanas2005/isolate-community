import { Committee } from '@/lib/types/committees';
import { Users, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CommitteeCardProps {
    committee: Committee;
    basePath: string;
}

export default function CommitteeCard({ committee, basePath }: CommitteeCardProps) {
    const typeColor = {
        MANAGEMENT: 'bg-blue-100 text-blue-700',
        ADVISORY: 'bg-green-100 text-green-700',
        SPECIAL: 'bg-purple-100 text-purple-700',
    }[committee.type];

    return (
        <Link
            href={`${basePath}/${committee.id}`}
            className="block bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{committee.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{committee.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColor}`}>
                    {committee.type}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(committee.created_at).toLocaleDateString()}
                </div>
            </div>
        </Link>
    );
}
