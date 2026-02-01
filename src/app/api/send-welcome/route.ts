import { NextRequest, NextResponse } from 'next/server';
import { sendCommunityWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, communityName, userEmail, userName } = body;

        if (!tenantId || !userEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sendCommunityWelcomeEmail(
            tenantId,
            communityName || 'A community',
            userEmail,
            userName
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Send welcome email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
