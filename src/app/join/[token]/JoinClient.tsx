'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Check, X, Building2, User } from 'lucide-react';

interface JoinClientProps {
    invitation: any;
    isLoggedIn: boolean;
    userEmail?: string;
}

export default function JoinClient({ invitation, isLoggedIn, userEmail }: JoinClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);

    const tenant = invitation.tenant;
    const inviter = invitation.inviter;

    async function acceptInvitation() {
        if (!isLoggedIn) {
            // Store token and redirect to login
            sessionStorage.setItem('pending_invite', invitation.invite_token);
            router.push('/login');
            return;
        }

        setAccepting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user email matches invitation
        if (user.email!.toLowerCase() !== invitation.invitee_email.toLowerCase()) {
            alert(`This invitation is for ${invitation.invitee_email}. You are logged in as ${user.email}.`);
            setAccepting(false);
            return;
        }

        // Create membership
        const { error: membershipError } = await supabase.from('memberships').insert({
            tenant_id: tenant.id,
            user_id: user.id,
            role: invitation.role,
            status: 'active'
        });

        if (membershipError) {
            alert('Failed to join community: ' + membershipError.message);
            setAccepting(false);
            return;
        }

        // Update invitation status
        await supabase
            .from('community_invitations')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', invitation.id);

        // Send welcome email
        try {
            await fetch('/api/send-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: tenant.id,
                    communityName: tenant.name,
                    userEmail: user.email
                })
            });
        } catch (e) {
            console.error('Failed to send welcome email:', e);
        }

        // Redirect to dashboard
        router.push(`/dashboard/${tenant.slug}`);
    }

    async function declineInvitation() {
        setDeclining(true);

        await supabase
            .from('community_invitations')
            .update({ status: 'rejected' })
            .eq('id', invitation.id);

        router.push('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md">
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-gray-800 rounded-2xl p-8">
                    {/* Community Info */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-10 h-10 text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            You're Invited! 🎉
                        </h1>
                        <p className="text-gray-400">
                            Join <strong className="text-white">{tenant.name}</strong>
                        </p>
                    </div>

                    {/* Invitation Details */}
                    <div className="bg-gray-900/60 rounded-xl p-4 mb-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Invited by</div>
                                <div className="text-white font-medium">
                                    {inviter?.name || inviter?.email || 'A community member'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Your Role</span>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full capitalize">
                                {invitation.role}
                            </span>
                        </div>

                        {tenant.description && (
                            <p className="text-sm text-gray-400 border-t border-gray-800 pt-3">
                                {tenant.description}
                            </p>
                        )}
                    </div>

                    {/* Personal Message */}
                    {invitation.message && (
                        <div className="mb-6 border-l-2 border-purple-500 pl-4">
                            <p className="text-gray-300 italic">"{invitation.message}"</p>
                            <p className="text-sm text-gray-500 mt-1">— {inviter?.name || 'Inviter'}</p>
                        </div>
                    )}

                    {/* Login Notice */}
                    {!isLoggedIn && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                            <p className="text-sm text-yellow-400">
                                You'll need to sign in or create an account to accept this invitation.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={declineInvitation}
                            disabled={declining}
                            className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {declining ? 'Declining...' : (
                                <>
                                    <X className="w-4 h-4" />
                                    Decline
                                </>
                            )}
                        </button>
                        <button
                            onClick={acceptInvitation}
                            disabled={accepting}
                            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {accepting ? 'Joining...' : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {isLoggedIn ? 'Accept & Join' : 'Sign In & Join'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
