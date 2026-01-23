'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, X, Globe, Lock } from 'lucide-react';

interface JoinCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JoinCommunityModal({ isOpen, onClose }: JoinCommunityModalProps) {
    const supabase = createClient();
    const router = useRouter();

    const [communityId, setCommunityId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 2. Validate Community Exists
            const { data: tenant, error: tError } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', communityId)
                .single();

            if (tError || !tenant) {
                throw new Error('Community not found. Check the ID.');
            }

            // 3. Check if already member
            const { data: existing } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', user.id)
                .eq('tenant_id', communityId)
                .single();

            if (existing) {
                throw new Error('You are already a member of this community.');
            }

            // 4. Join as Member
            const { error: mError } = await supabase
                .from('memberships')
                .insert({
                    user_id: user.id,
                    tenant_id: communityId,
                    role: 'Member',
                    dynamic_data: { joined_via: 'id_lookup' }
                });

            if (mError) throw mError;

            // 5. Success
            onClose();
            setCommunityId('');
            router.refresh(); // Refresh grid

        } catch (err: any) {
            setError(err.message || 'Failed to join');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Join Community</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleJoin} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Community ID or Invite Code</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                            <input
                                required
                                value={communityId}
                                onChange={(e) => setCommunityId(e.target.value)}
                                placeholder="e.g. 550e8400-e29b..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <p className="text-xs text-white/30 mt-2 ml-1">
                            Ask the community admin for their unique ID.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Join Now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
