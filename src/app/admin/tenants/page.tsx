'use client';

import { use, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, Building2, Users, Calendar } from 'lucide-react';

export default function TenantsPage() {
    const supabase = createClient();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Fetch tenants
    useState(() => {
        loadTenants();
    });

    async function loadTenants() {
        setLoading(true);
        const { data } = await supabase
            .from('tenants')
            .select(`
                *,
                memberships(count)
            `)
            .order('created_at', { ascending: false });

        setTenants(data || []);
        setLoading(false);
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">All Communities</h2>
                    <p className="text-gray-400">Manage tenants across the platform</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or slug..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Tenants Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Community</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredTenants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No communities found
                                </td>
                            </tr>
                        ) : (
                            filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-800/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div className="font-medium text-white">{tenant.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                                        /{tenant.slug}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Users className="w-4 h-4" />
                                            {tenant.memberships?.[0]?.count || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(tenant.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
