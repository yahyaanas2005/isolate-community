'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Building, Users, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [loading, setLoading] = useState(false);

    // Create Form State
    const [communityName, setCommunityName] = useState('');
    const [communitySlug, setCommunitySlug] = useState('');

    // Join Form State
    const [searchQuery, setSearchQuery] = useState('');

    async function handleCreate() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            // 1. Transactional RPC Call (Bypasses Schema Cache & RLS)
            const { data, error } = await supabase.rpc('create_community', {
                name_input: communityName,
                slug_input: communitySlug
            });

            if (error) throw error;

            // 3. Redirect
            // @ts-ignore
            router.push(`/dashboard/${data.slug}`);
        } catch (e) {
            alert('Error creating community: ' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Isolate</h1>
                    <p className="text-gray-500 mt-2">Let's get you settled in.</p>
                </div>

                {mode === 'select' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('create')}
                            className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Create a New Community</h3>
                                    <p className="text-xs text-gray-500">I am an owner or manager.</p>
                                </div>
                                <ArrowRight className="w-5 h-5 ml-auto text-gray-300 group-hover:text-blue-600" />
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Join Existing Community</h3>
                                    <p className="text-xs text-gray-500">I have an invite code.</p>
                                </div>
                                <ArrowRight className="w-5 h-5 ml-auto text-gray-300 group-hover:text-green-600" />
                            </div>
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                            <input
                                value={communityName}
                                onChange={(e) => {
                                    setCommunityName(e.target.value);
                                    setCommunitySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                }}
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                placeholder="e.g. Sunset Villas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                            <div className="flex items-center gap-1 text-gray-400 bg-gray-50 p-3 rounded-lg border">
                                <span className="text-xs">isolate.com/</span>
                                <input
                                    value={communitySlug}
                                    onChange={(e) => setCommunitySlug(e.target.value)}
                                    className="bg-transparent flex-1 text-gray-900 outline-none font-mono text-sm"
                                    placeholder="sunset-villas"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={loading || !communityName || !communitySlug}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating...' : 'Create & Continue'}
                        </button>
                        <button onClick={() => setMode('select')} className="w-full text-center text-sm text-gray-500 py-2 hover:text-gray-900">Back</button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-6">Ask your community manager for an invite link. Public search coming soon.</p>
                        <button onClick={() => setMode('select')} className="text-blue-600 font-medium hover:underline">Go Back</button>
                    </div>
                )}

            </div>
        </div>
    );
}
