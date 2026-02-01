import { Sidebar } from '@/components/Sidebar';
import GlobalSearch from '@/components/GlobalSearch';
import MobileNav from '@/components/layout/MobileNav';
import NotificationBell from '@/components/notifications/NotificationBell';
import { createClient } from '@/utils/supabase/server';
import { getUnreadCount } from '@/actions/notifications';
import CoordinatorChat from '@/components/ai/CoordinatorChat';

export default async function CommunityLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    // Optimistically assume we can get ID from slug or just pass slug if action handles it.
    // However, getUnreadCount ignores tenantId currently but let's pass it for future proofing.
    // To safe round trip, we rely on the action to be robust or we just use slug.
    // Let's quickly resolve tenant for correctness.
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug; // Fallback

    const { count: unreadCount } = await getUnreadCount(tenantId);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden flex-col md:flex-row">
            {/* Mobile Header */}
            <MobileNav slug={slug} />

            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">
                <Sidebar slug={slug} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-6 shrink-0">
                    <div className="font-semibold text-lg capitalize">{slug.replace('-', ' ')}</div>
                    <div className="flex items-center gap-4">
                        <GlobalSearch communitySlug={slug} />
                        <NotificationBell tenantId={tenantId} initialCount={unreadCount || 0} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            {/* AI Agent Overlay */}
            <CoordinatorChat />
        </div>
    );
}
