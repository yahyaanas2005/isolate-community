'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/TenantContext';
import { Membership, PhysicalMemberData, ProfessionalMemberData, VirtualMemberData } from '@/lib/types';

// Mock Memberships Data
const MOCK_MEMBERSHIPS: Membership[] = [
    // Physical Community Members
    {
        id: 'm1',
        user_id: 'u1',
        tenant_id: '11111111-1111-1111-1111-111111111111', // Sunnyvale Heights
        role: 'Member',
        dynamic_data: { unit_number: 'A-101', resident_type: 'Owner' } as PhysicalMemberData,
        profile: { id: 'u1', email: 'john@example.com', full_name: 'John Doe', avatar_url: 'https://i.pravatar.cc/150?u=u1' },
    },
    {
        id: 'm2',
        user_id: 'u2',
        tenant_id: '11111111-1111-1111-1111-111111111111',
        role: 'Admin',
        dynamic_data: { unit_number: 'B-205', resident_type: 'Tenant' } as PhysicalMemberData,
        profile: { id: 'u2', email: 'jane@example.com', full_name: 'Jane Smith', avatar_url: 'https://i.pravatar.cc/150?u=u2' },
    },
    // Professional Community Members
    {
        id: 'm3',
        user_id: 'u1', // same user, different community
        tenant_id: '22222222-2222-2222-2222-222222222222', // Cardio Assoc
        role: 'Member',
        dynamic_data: { license_id: 'MD-555', specialization: 'Cardiology' } as ProfessionalMemberData,
        profile: { id: 'u1', email: 'john@example.com', full_name: 'Dr. John Doe', avatar_url: 'https://i.pravatar.cc/150?u=u1' },
    },
    // Virtual Community Members
    {
        id: 'm4',
        user_id: 'u3',
        tenant_id: '33333333-3333-3333-3333-333333333333', // Global Gamers
        role: 'Member',
        dynamic_data: { gamertag: 'xX_Slayer_Xx', reputation_score: 9001 } as VirtualMemberData,
        profile: { id: 'u3', email: 'gamer@example.com', full_name: 'Gamer One', avatar_url: 'https://i.pravatar.cc/150?u=u3' },
    },
];

export default function MembersPage() {
    const { tenant, availableTenants, switchTenant } = useTenant();
    const [members, setMembers] = useState<Membership[]>([]);

    useEffect(() => {
        if (tenant) {
            // Filter mock data by tenant
            const tenantMembers = MOCK_MEMBERSHIPS.filter((m) => m.tenant_id === tenant.id);
            setMembers(tenantMembers);
        }
    }, [tenant]);

    if (!tenant) return <div>Loading...</div>;

    return (
        <div className="p-8">
            {/* Header & Tenant Switcher */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        {tenant.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Community Type: <span className="font-semibold">{tenant.type}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    {availableTenants.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => switchTenant(t.slug)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${tenant.id === t.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No members found in this community context.</td>
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
                                                    <img className="h-10 w-10 rounded-full" src={member.profile?.avatar_url || ''} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.profile?.full_name}</div>
                                                    <div className="text-sm text-gray-500">{member.profile?.email}</div>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pData.unit_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pData.resident_type}</td>
                                            </>
                                        )}
                                        {isProfessional && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proData.license_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proData.specialization}</td>
                                            </>
                                        )}
                                        {isVirtual && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vData.gamertag}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vData.reputation_score}</td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
