'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Mail, Check, X, Building2 } from 'lucide-react';

export default function MyInvitationsPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvitations();
    }, []);

    async function loadInvitations() {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();

        if (!profile?.email) return;

        const { data } = await supabase
            .from('community_invitations')
            .select(`
                *,
                tenant:tenants(id, name, slug, description),
                inviter:profiles!invited_by(name, email)
            `)
            .eq('invitee_email', profile.email)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        setInvitations(data || []);
        setLoading(false);
    }

    async function acceptInvitation(invitation: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create membership
        await supabase.from('memberships').insert({
            tenant_id: invitation.tenant.id,
            user_id: user.id,
            role: invitation.role,
            status: 'active'
        });

        // Update invitation
        await supabase
            .from('community_invitations')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', invitation.id);

        // Redirect to the community
        router.push(`/dashboard/${invitation.tenant.slug}`);
    }

    async function declineInvitation(invitationId: string) {
        await supabase
            .from('community_invitations')
            .update({ status: 'rejected' })
            .eq('id', invitationId);

        loadInvitations();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Pending Invitations</h1>
                <p className="text-gray-400">Community invitations waiting for your response</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : invitations.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Pending Invitations</h3>
                    <p className="text-gray-400">You're all caught up! No invitations waiting.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {invitations.map((inv) => (
                        <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{inv.tenant.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            Invited by {inv.inviter?.name || inv.inviter?.email || 'A member'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded capitalize">
                                                {inv.role}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {inv.message && (
                                            <p className="text-sm text-gray-300 mt-3 italic">
                                                "{inv.message}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => declineInvitation(inv.id)}
                                        className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => acceptInvitation(inv)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
