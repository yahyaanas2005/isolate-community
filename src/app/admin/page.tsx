import { createClient } from '@/utils/supabase/server';
import { Users, Building2, DollarSign, Activity } from 'lucide-react';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch stats
    const [usersCount, tenantsCount, membershipsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('memberships').select('id', { count: 'exact', head: true }),
    ]);

    const stats = [
        {
            title: 'Total Users',
            value: usersCount.count || 0,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Total Communities',
            value: tenantsCount.count || 0,
            icon: Building2,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'Total Memberships',
            value: membershipsCount.count || 0,
            icon: Activity,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            title: 'Revenue (Mock)',
            value: '$12,450',
            icon: DollarSign,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
    ];

    // Recent tenants
    const { data: recentTenants } = await supabase
        .from('tenants')
        .select('name, slug, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
                <p className="text-gray-400">Manage the entire Isolate Community platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Communities</h3>
                <div className="space-y-3">
                    {recentTenants?.map((tenant) => (
                        <div key={tenant.slug} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                            <div>
                                <div className="font-medium text-white">{tenant.name}</div>
                                <div className="text-sm text-gray-400">/{tenant.slug}</div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(tenant.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {(!recentTenants || recentTenants.length === 0) && (
                        <p className="text-gray-500 text-center py-8">No communities yet</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/admin/tenants" className="block p-6 bg-purple-900/20 border border-purple-800 rounded-xl hover:bg-purple-900/30 transition-colors">
                    <h4 className="font-bold text-white mb-2">Manage Tenants</h4>
                    <p className="text-sm text-gray-400">View and edit all communities</p>
                </a>
                <a href="/admin/users" className="block p-6 bg-blue-900/20 border border-blue-800 rounded-xl hover:bg-blue-900/30 transition-colors">
                    <h4 className="font-bold text-white mb-2">Manage Users</h4>
                    <p className="text-sm text-gray-400">Search and edit user permissions</p>
                </a>
                <a href="/admin/settings" className="block p-6 bg-yellow-900/20 border border-yellow-800 rounded-xl hover:bg-yellow-900/30 transition-colors">
                    <h4 className="font-bold text-white mb-2">System Settings</h4>
                    <p className="text-sm text-gray-400">Configure SMTP, payments, etc.</p>
                </a>
            </div>
        </div>
    );
}
