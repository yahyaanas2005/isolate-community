'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/components/TenantContext';
import { Membership, PhysicalMemberData, ProfessionalMemberData, VirtualMemberData } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import AddMemberModal from '@/components/AddMemberModal';

export default function MembersPage() {
    const { tenant, availableTenants, switchTenant } = useTenant();
    const [members, setMembers] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Memoize fetchMembers to allow it to be used in dependency arrays or callbacks
    const fetchMembers = useCallback(async () => {
        if (!tenant) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('memberships')
                .select(`
            *,
            profile:profiles(*)
        `)
                .eq('tenant_id', tenant.id);

            if (error) {
                console.error('Error fetching members:', error);
            } else {
                setMembers(data as Membership[]);
            }
        } catch (e) {
            console.error('Unexpected fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [tenant]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    if (!tenant) return <div>No community selected.</div>;

    return (
        <div className="p-8">
            {/* Header & Tenant Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        {tenant.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Community Type: <span className="font-semibold">{tenant.type}</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {availableTenants.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => switchTenant(t.slug)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${tenant.id === t.id
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="ml-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
                    >
                        + Add Member
                    </button>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>

                            {/* Dynamic Header based on Type */}
                            {tenant.type === 'Physical' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                </>
                            )}
                            {tenant.type === 'Professional' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                                </>
                            )}
                            {tenant.type === 'Virtual' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gamertag</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputation</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {!loading && members.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No members found. <br /> Click "Add Member" to create one.
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => {
                                // Type Guards for cleaner TS use in render
                                const isPhysical = tenant.type === 'Physical';
                                const isProfessional = tenant.type === 'Professional';
                                const isVirtual = tenant.type === 'Virtual';

                                // Cast dynamic data once based on content context knowledge
                                const pData = member.dynamic_data as PhysicalMemberData;
                                const proData = member.dynamic_data as ProfessionalMemberData;
                                const vData = member.dynamic_data as VirtualMemberData;

                                return (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={member.profile?.avatar_url || `https://ui-avatars.com/api/?name=${member.profile?.full_name || 'User'}`} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.profile?.full_name || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500">{member.profile?.email || 'No Email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {member.role}
                                            </span>
                                        </td>

                                        {/* Dynamic Cells */}
                                        {isPhysical && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pData?.unit_number || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pData?.resident_type || '-'}</td>
                                            </>
                                        )}
                                        {isProfessional && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proData?.license_id || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proData?.specialization || '-'}</td>
                                            </>
                                        )}
                                        {isVirtual && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vData?.gamertag || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vData?.reputation_score || '-'}</td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <AddMemberModal
                    tenant={tenant}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        fetchMembers(); // Refresh list
                    }}
                />
            )}
        </div>
    );
}
