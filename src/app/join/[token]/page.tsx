import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import JoinClient from './JoinClient';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    // Find invitation
    const { data: invitation } = await supabase
        .from('community_invitations')
        .select(`
            *,
            tenant:tenants(id, name, slug, description),
            inviter:profiles!invited_by(name, email)
        `)
        .eq('invite_token', token)
        .single();

    if (!invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
                    <p className="text-gray-400 mb-6">
                        This invitation link is invalid or has been revoked.
                    </p>
                    <a href="/login" className="text-purple-400 hover:text-purple-300">
                        Go to Login →
                    </a>
                </div>
            </div>
        );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⏰</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invitation Expired</h1>
                    <p className="text-gray-400 mb-6">
                        This invitation has expired. Please ask the community admin to send a new one.
                    </p>
                    <a href="/login" className="text-purple-400 hover:text-purple-300">
                        Go to Login →
                    </a>
                </div>
            </div>
        );
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
        const tenant = invitation.tenant as any;
        redirect(`/dashboard/${tenant.slug}`);
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Pass data to client component
    return (
        <JoinClient
            invitation={invitation}
            isLoggedIn={!!user}
            userEmail={user?.email}
        />
    );
}
