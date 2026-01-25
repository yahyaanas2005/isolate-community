import { Notice } from '@/lib/types/notices';
import { Bell, AlertTriangle, Info, Calendar } from 'lucide-react';

interface NoticeCardProps {
    notice: Notice;
}

export default function NoticeCard({ notice }: NoticeCardProps) {
    const priorityColor = {
        LOW: 'bg-blue-50 border-blue-200',
        MEDIUM: 'bg-yellow-50 border-yellow-200',
        HIGH: 'bg-orange-50 border-orange-200',
        URGENT: 'bg-red-50 border-red-200',
    }[notice.priority];

    const Icon = notice.priority === 'URGENT' ? AlertTriangle : notice.category === 'EVENT' ? Calendar : Bell;

    return (
        <div className={`p-4 rounded-xl border-2 ${priorityColor} transition-all hover:shadow-md`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${notice.priority === 'URGENT' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Icon className={`w-5 h-5 ${notice.priority === 'URGENT' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-white rounded-full font-medium text-gray-600">
                            {notice.category}
                        </span>
                        {notice.expires_at && (
                            <span className="text-xs text-gray-500">
                                Expires: {new Date(notice.expires_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
