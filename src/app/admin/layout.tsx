import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check support team status (super admin or sub admin)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, is_sub_admin, name, email')
        .eq('id', user.id)
        .single();

    const isSupportTeam = profile?.is_super_admin || profile?.is_sub_admin;

    if (!isSupportTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
                    <p className="text-gray-400 mb-6">
                        This area is for the Isolate Support Team only.
                    </p>
                    <a href="/" className="text-purple-400 hover:text-purple-300">
                        ← Back to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Support Dashboard Header */}
            <div className="border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-xl">🛡️</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    Support Dashboard
                                </h1>
                                <p className="text-sm text-gray-400">
                                    {profile.is_super_admin ? 'Platform Admin' : 'Support Assistant'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{profile.name || profile.email}</span>
                            <a
                                href="/"
                                className="text-sm text-purple-400 hover:text-purple-300"
                            >
                                Exit to Platform →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-800 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex gap-1 overflow-x-auto">
                        <NavLink href="/admin">Overview</NavLink>
                        <NavLink href="/admin/tenants">Communities</NavLink>
                        <NavLink href="/admin/users">Users</NavLink>
                        {profile.is_super_admin && (
                            <>
                                <NavLink href="/admin/team">Support Team</NavLink>
                                <NavLink href="/admin/smtp">Email Accounts</NavLink>
                                <NavLink href="/admin/settings">Settings</NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </div>
        </div>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white border-b-2 border-transparent hover:border-purple-500 transition-colors whitespace-nowrap"
        >
            {children}
        </a>
    );
}
