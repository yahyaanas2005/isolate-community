import { getNotices, getNoticeCategories } from '@/actions/notices';
import NoticeList from '@/components/notices/NoticeList';
import CreateNoticeDialog from '@/components/notices/CreateNoticeDialog';
import { Megaphone } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

interface NoticesPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ type?: string; search?: string }>;
}

export default async function NoticesPage({ params, searchParams }: NoticesPageProps) {
    const { slug } = await params;
    const { type, search } = await searchParams;
    const supabase = await createClient();

    // 1. Resolve slug to tenant_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return <div className="p-6 text-red-600">Community not found</div>;
    }

    // 2. Fetch Data
    const [noticesData, categoriesData] = await Promise.all([
        getNotices(tenant.id, { type, search }),
        getNoticeCategories(tenant.id)
    ]);

    const { data: notices, error } = noticesData;
    const { data: categories } = categoriesData;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-7 h-7 text-indigo-600" />
                        Digital Notice Board
                    </h1>
                    <p className="text-sm text-gray-500">Official updates, alerts, and events.</p>
                </div>
                {/* Check role permissions technically, but for MVP we show button. Dialog handles auth */}
                <CreateNoticeDialog
                    tenantId={tenant.id}
                    categories={categories || []}
                />
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    Error loading notices: {error.message}
                </div>
            ) : (
                <NoticeList notices={notices as any[] || []} />
            )}
        </div>
    );
}
