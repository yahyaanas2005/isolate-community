import { Sidebar } from '@/components/Sidebar';
import GlobalSearch from '@/components/GlobalSearch';
import MobileNav from '@/components/layout/MobileNav';

export default async function CommunityLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
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
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
