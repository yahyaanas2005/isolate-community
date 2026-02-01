'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shield, Plus, X, Check, MapPin } from 'lucide-react';

export default function SupportTeamPage() {
    const supabase = createClient();
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newRegions, setNewRegions] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadTeam();
    }, []);

    async function loadTeam() {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .or('is_super_admin.eq.true,is_sub_admin.eq.true')
            .order('is_super_admin', { ascending: false });

        setTeam(data || []);
        setLoading(false);
    }

    async function addSubAdmin() {
        setAdding(true);

        // Find user by email
        const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', newEmail)
            .single();

        if (!user) {
            alert('User not found with that email');
            setAdding(false);
            return;
        }

        const regions = newRegions ? newRegions.split(',').map(r => r.trim()) : [];

        await supabase
            .from('profiles')
            .update({ is_sub_admin: true, assigned_regions: regions })
            .eq('id', user.id);

        setNewEmail('');
        setNewRegions('');
        setShowAddModal(false);
        setAdding(false);
        loadTeam();
    }

    async function removeSubAdmin(userId: string) {
        if (!confirm('Remove this user from support team?')) return;

        await supabase
            .from('profiles')
            .update({ is_sub_admin: false, assigned_regions: null })
            .eq('id', userId);

        loadTeam();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Support Team</h2>
                    <p className="text-gray-400">Manage platform admins and support assistants</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Support Member
                </button>
            </div>

            {/* Team List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : team.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No support team members</div>
                ) : (
                    team.map((member) => (
                        <div key={member.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.is_super_admin ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                    <Shield className={`w-6 h-6 ${member.is_super_admin ? 'text-purple-400' : 'text-blue-400'}`} />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{member.name || 'Unnamed'}</div>
                                    <div className="text-sm text-gray-400">{member.email}</div>
                                    {member.assigned_regions?.length > 0 && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            {member.assigned_regions.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-sm rounded-full ${member.is_super_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {member.is_super_admin ? 'Platform Admin' : 'Support Assistant'}
                                </span>
                                {!member.is_super_admin && (
                                    <button
                                        onClick={() => removeSubAdmin(member.id)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Add Support Member</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    User Email
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Assigned Regions (optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={newRegions}
                                    onChange={(e) => setNewRegions(e.target.value)}
                                    placeholder="us, eu, asia"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty for global support access
                                </p>
                            </div>

                            <button
                                onClick={addSubAdmin}
                                disabled={adding || !newEmail}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {adding ? 'Adding...' : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Add to Support Team
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
