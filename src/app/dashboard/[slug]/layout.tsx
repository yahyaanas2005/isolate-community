import { Sidebar } from '@/components/Sidebar';

export default async function CommunityLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Fixed Sidebar */}
            <Sidebar slug={slug} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
                    {/* We can re-add the SearchBar and NotificationBell here if we want them global per community */}
                    <div className="font-semibold text-lg capitalize">{slug.replace('-', ' ')}</div>
                    <div className="flex items-center gap-4">
                        {/* Placeholders for header items */}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
