'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust path as needed
import { Tenant, UserRole } from '@/lib/types';

interface AddMemberModalProps {
    tenant: Tenant;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMemberModal({ tenant, onClose, onSuccess }: AddMemberModalProps) {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('Member');

    // Dynamic Fields State
    const [unitNumber, setUnitNumber] = useState(''); // Physical
    const [residentType, setResidentType] = useState('Owner'); // Physical
    const [licenseId, setLicenseId] = useState(''); // Professional
    const [specialization, setSpecialization] = useState(''); // Professional
    const [gamertag, setGamertag] = useState(''); // Virtual
    const [reputationScore, setReputationScore] = useState(0); // Virtual

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create or Find Profile (Simplistic approach: Create if not exists logic is complex without backend function, 
            // but we will try to INSERT id gen_random_uuid for profile if we can't link to auth user yet.
            // REALITY: We need an auth user. 
            // WORKAROUND: We will insert into 'profiles' with a random UUID.
            const newUserId = crypto.randomUUID();

            const { error: profileError } = await supabase.from('profiles').insert({
                id: newUserId,
                email,
                full_name: fullName,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`
            });

            // Note: If email conflict, we might want to select the existing user. 
            // For this simple demo, we'll assume new user or catch error.
            if (profileError) {
                // Try to fetch existing profile by email?
                // This requires Select permissions.
                if (profileError.code === '23505') { // Unique violation
                    const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single();
                    if (!existingUser) throw new Error('User exists but cannot be retrieved.');
                    // Use existing ID
                    // Continue to membership...
                    // BUT, we can't re-use 'newUserId', we'd need to use existingUser.id.
                    // This logic gets messy quickly without a proper backend function.
                    // We will ERROR out for now if user exists, saying "User already registered in system".
                    throw new Error('User with this email already exists globally.');
                }
                throw profileError;
            }

            // 2. Prepare Dynamic Data
            let dynamicData = {};
            if (tenant.type === 'Physical') {
                dynamicData = { unit_number: unitNumber, resident_type: residentType };
            } else if (tenant.type === 'Professional') {
                dynamicData = { license_id: licenseId, specialization: specialization };
            } else if (tenant.type === 'Virtual') {
                dynamicData = { gamertag, reputation_score: Number(reputationScore) };
            }

            // 3. Insert Membership
            const { error: memberError } = await supabase.from('memberships').insert({
                user_id: newUserId,
                tenant_id: tenant.id,
                role,
                dynamic_data: dynamicData
            });

            if (memberError) throw memberError;

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Add Member to {tenant.name}</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text" required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                            value={fullName} onChange={e => setFullName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email" required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                            value={role} onChange={e => setRole(e.target.value as UserRole)}
                        >
                            <option value="Member">Member</option>
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">{tenant.type} Details</h3>

                        {tenant.type === 'Physical' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                                    <input
                                        type="text" required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={unitNumber} onChange={e => setUnitNumber(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Resident Type</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={residentType} onChange={e => setResidentType(e.target.value)}
                                    >
                                        <option value="Owner">Owner</option>
                                        <option value="Tenant">Tenant</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {tenant.type === 'Professional' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">License ID</label>
                                    <input
                                        type="text" required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={licenseId} onChange={e => setLicenseId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                    <input
                                        type="text" required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={specialization} onChange={e => setSpecialization(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {tenant.type === 'Virtual' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gamertag</label>
                                    <input
                                        type="text" required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={gamertag} onChange={e => setGamertag(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reputation Score</label>
                                    <input
                                        type="number" required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-solid"
                                        value={reputationScore} onChange={e => setReputationScore(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
