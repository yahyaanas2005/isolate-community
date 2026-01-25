'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Building2, Users, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [existingCommunities, setExistingCommunities] = useState<any[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [communityName, setCommunityName] = useState('');
    const [communitySlug, setCommunitySlug] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkExistingMemberships();
    }, []);

    async function checkExistingMemberships() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: memberships } = await supabase
                .from('memberships')
                .select('tenant_id, role, tenants(id, name, slug)')
                .eq('user_id', user.id);

            if (memberships && memberships.length > 0) {
                setExistingCommunities(memberships);
            }
        } catch (error) {
            console.error('Error checking memberships:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: communityName,
                    slug: communitySlug,
                    type: 'RESIDENTIAL'
                })
                .select()
                .single();

            if (tenantError) throw tenantError;

            const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: user.id,
                    tenant_id: tenant.id,
                    role: 'Owner'
                });

            if (membershipError) throw membershipError;

            router.push(`/dashboard/${tenant.slug}`);
        } catch (e) {
            alert('Error creating community: ' + (e as Error).message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Show existing communities if user has any
    if (existingCommunities.length > 0 && mode === 'select') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
                    <h1 className="text-3xl font-bold text-center mb-2">Welcome Back!</h1>
                    <p className="text-gray-600 text-center mb-8">Select a community to continue</p>

                    <div className="space-y-3 mb-6">
                        {existingCommunities.map((membership: any) => {
                            const community = membership.tenants;
                            return (
                                <button
                                    key={community.id}
                                    onClick={() => router.push(`/dashboard/${community.slug}`)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{community.name}</h3>
                                                <p className="text-sm text-gray-500">{membership.role}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t">
                        <button
                            onClick={() => setMode('create')}
                            className="w-full py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                        >
                            + Create Another Community
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Original create/join UI
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                {mode === 'select' && (
                    <>
                        <h1 className="text-3xl font-bold text-center mb-2">Welcome to Isolate</h1>
                        <p className="text-gray-600 text-center mb-8">Let&apos;s get you settled in.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setMode('create')}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                                        <Building2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Create a New Community</h3>
                                        <p className="text-sm text-gray-500">I am an owner or manager.</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('join')}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Join Existing Community</h3>
                                        <p className="text-sm text-gray-500">I have an invite code.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {mode === 'create' && (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Create Your Community</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                                <input
                                    type="text"
                                    value={communityName}
                                    onChange={(e) => {
                                        setCommunityName(e.target.value);
                                        setCommunitySlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Sunset Gardens"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">isolate.com/</span>
                                    <input
                                        type="text"
                                        value={communitySlug}
                                        onChange={(e) => setCommunitySlug(e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="sunset-gardens"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={submitting || !communityName || !communitySlug}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Creating...' : 'Create Community'}
                            </button>
                            <button
                                onClick={() => setMode('select')}
                                className="w-full py-2 text-gray-600 hover:text-gray-900"
                            >
                                Back
                            </button>
                        </div>
                    </>
                )}

                {mode === 'join' && (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Join Community</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="ABC123"
                                />
                            </div>
                            <button
                                disabled={!inviteCode}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Join Community
                            </button>
                            <button
                                onClick={() => setMode('select')}
                                className="w-full py-2 text-gray-600 hover:text-gray-900"
                            >
                                Back
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
