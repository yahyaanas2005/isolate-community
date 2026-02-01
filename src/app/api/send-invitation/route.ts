import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, communityName, inviterName, inviteeEmail, role, inviteToken, message } = body;

        if (!tenantId || !inviteeEmail || !inviteToken) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sendInvitationEmail(
            tenantId,
            inviterName || 'A community member',
            communityName || 'A community',
            inviteeEmail,
            null, // invitee name (unknown at this point)
            role || 'member',
            inviteToken,
            message
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, smtpUsed: result.smtpUsed });

    } catch (error) {
        console.error('Send invitation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
