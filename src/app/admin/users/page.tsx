'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, User, Shield, Mail, MapPin } from 'lucide-react';

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select(`
                *,
                memberships(count)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        setUsers(data || []);
        setLoading(false);
    }

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">All Users</h2>
                    <p className="text-gray-400">Manage platform users worldwide</p>
                </div>
                <div className="text-sm text-gray-500">
                    {users.length} total users
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Communities</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="font-medium text-white">
                                                {user.name || 'Unnamed User'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Mail className="w-4 h-4" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {user.memberships?.[0]?.count || 0} communities
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_super_admin ? (
                                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1 w-fit">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        ) : user.is_sub_admin ? (
                                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1 w-fit">
                                                <Shield className="w-3 h-3" /> Support
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-sm">User</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
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
