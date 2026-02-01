'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Mail, Send, UserPlus, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function InvitePage() {
    const params = useParams();
    const slug = params.slug as string;
    const supabase = createClient();

    const [tenantId, setTenantId] = useState<string | null>(null);
    const [tenantName, setTenantName] = useState('');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [emails, setEmails] = useState('');
    const [role, setRole] = useState('member');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        async function init() {
            // Get tenant
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id, name')
                .eq('slug', slug)
                .single();

            if (tenant) {
                setTenantId(tenant.id);
                setTenantName(tenant.name);
                loadInvitations(tenant.id);
            }
        }
        init();
    }, [slug]);

    async function loadInvitations(tid: string) {
        setLoading(true);
        const { data } = await supabase
            .from('community_invitations')
            .select('*, invited_by_profile:profiles!invited_by(name, email)')
            .eq('tenant_id', tid)
            .order('created_at', { ascending: false });

        setInvitations(data || []);
        setLoading(false);
    }

    async function sendInvitations() {
        if (!tenantId || !emails.trim()) return;

        setSending(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', user.id)
            .single();

        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);

        for (const inviteeEmail of emailList) {
            // Create invitation record
            const { data: invitation, error } = await supabase
                .from('community_invitations')
                .insert({
                    tenant_id: tenantId,
                    invited_by: user.id,
                    invitee_email: inviteeEmail,
                    role: role,
                    message: message || null
                })
                .select()
                .single();

            if (invitation) {
                // Send invitation email via API
                try {
                    await fetch('/api/send-invitation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tenantId,
                            communityName: tenantName,
                            inviterName: profile?.name || profile?.email || 'A community member',
                            inviteeEmail,
                            role,
                            inviteToken: invitation.invite_token,
                            message
                        })
                    });
                } catch (e) {
                    console.error('Failed to send email:', e);
                }
            }
        }

        setEmails('');
        setMessage('');
        setSending(false);
        loadInvitations(tenantId);
    }

    async function cancelInvitation(id: string) {
        await supabase
            .from('community_invitations')
            .delete()
            .eq('id', id);

        if (tenantId) loadInvitations(tenantId);
    }

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        accepted: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
        expired: 'bg-gray-500/20 text-gray-400'
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Invite Members</h1>
                <p className="text-gray-400">Send email invitations to join {tenantName}</p>
            </div>

            {/* Invite Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-400" />
                    Send Invitations
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Addresses (comma-separated)
                        </label>
                        <textarea
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder="john@example.com, jane@example.com"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="member">Member</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Personal Message (optional)
                            </label>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Join our amazing community!"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={sendInvitations}
                        disabled={sending || !emails.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {sending ? (
                            <>Sending...</>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Invitations
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Sent Invitations */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    Sent Invitations
                </h2>

                {loading ? (
                    <p className="text-gray-400 text-center py-8">Loading...</p>
                ) : invitations.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No invitations sent yet</p>
                ) : (
                    <div className="space-y-3">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">
                                            {inv.invitee_name || inv.invitee_email}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Role: {inv.role} • Invited by {inv.invited_by_profile?.name || inv.invited_by_profile?.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusColors[inv.status]}`}>
                                        {inv.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {inv.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                        {inv.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {inv.status}
                                    </span>
                                    {inv.status === 'pending' && (
                                        <button
                                            onClick={() => cancelInvitation(inv.id)}
                                            className="text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
