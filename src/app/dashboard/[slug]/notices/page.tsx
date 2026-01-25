import { getNotices } from '@/actions/notices';
import NoticeCard from '@/components/notices/NoticeCard';
import CreateNoticeDialog from '@/components/notices/CreateNoticeDialog';
import { Bell } from 'lucide-react';

interface NoticesPageProps {
    params: Promise<{ slug: string }>;
}

export default async function NoticesPage({ params }: NoticesPageProps) {
    const { slug } = await params;
    const { data: notices, error } = await getNotices(slug);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-7 h-7 text-blue-600" />
                        Notice Board
                    </h1>
                    <p className="text-sm text-gray-500">Community announcements and updates</p>
                </div>
                <CreateNoticeDialog communityId={slug} />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load notices. Please try again.
                </div>
            )}

            <div className="space-y-4">
                {notices?.map(notice => (
                    <NoticeCard key={notice.id} notice={notice} />
                ))}
            </div>

            {notices?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No notices posted yet.</p>
                </div>
            )}
        </div>
    );
}
