/**
 * Enhanced Email Service with Multi-SMTP Routing
 * 
 * Priority: User SMTP → Community SMTP → Platform SMTP
 */

import { createClient } from '@/utils/supabase/server';

interface SMTPConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Get SMTP configuration based on priority:
 * 1. User SMTP (if enabled)
 * 2. Community SMTP (if enabled)
 * 3. Platform SMTP (fallback)
 */
async function getSMTPConfig(
    userId?: string,
    tenantId?: string,
    purpose?: 'welcome' | 'support' | 'transactional' | 'all'
): Promise<SMTPConfig | null> {
    const supabase = await createClient();

    // 1. Check User SMTP
    if (userId) {
        const { data: user } = await supabase
            .from('profiles')
            .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_enabled, email')
            .eq('id', userId)
            .single();

        if (user?.smtp_enabled && user.smtp_host) {
            return {
                host: user.smtp_host,
                port: user.smtp_port || 587,
                user: user.smtp_user,
                password: user.smtp_password,
                fromEmail: user.email,
                fromName: 'Personal'
            };
        }
    }

    // 2. Check Community SMTP
    if (tenantId) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_enabled, name')
            .eq('id', tenantId)
            .single();

        if (tenant?.smtp_enabled && tenant.smtp_host) {
            return {
                host: tenant.smtp_host,
                port: tenant.smtp_port || 587,
                user: tenant.smtp_user,
                password: tenant.smtp_password,
                fromEmail: tenant.smtp_from_email || tenant.smtp_user,
                fromName: tenant.smtp_from_name || tenant.name
            };
        }
    }

    // 3. Fallback to Platform SMTP
    let query = supabase.from('platform_smtp_accounts').select('*').eq('enabled', true);

    if (purpose && purpose !== 'all') {
        query = query.or(`purpose.eq.${purpose},purpose.is.null`);
    }

    const { data: platformSMTP } = await query.order('is_default', { ascending: false }).limit(1).single();

    if (platformSMTP) {
        return {
            host: platformSMTP.smtp_host,
            port: platformSMTP.smtp_port || 587,
            user: platformSMTP.smtp_user,
            password: platformSMTP.smtp_password,
            fromEmail: platformSMTP.smtp_from_email,
            fromName: platformSMTP.smtp_from_name || 'Isolate Support'
        };
    }

    return null;
}

/**
 * Send email using appropriate SMTP based on context
 */
export async function sendEmail(
    options: EmailOptions,
    context?: { userId?: string; tenantId?: string; purpose?: 'welcome' | 'support' | 'transactional' }
): Promise<{ success: boolean; error?: string; smtpUsed?: string }> {
    try {
        const smtp = await getSMTPConfig(context?.userId, context?.tenantId, context?.purpose);

        if (!smtp || !smtp.host) {
            console.log('[EMAIL MOCK] No SMTP configured. Would send:', options.subject, 'to', options.to);
            return { success: true, smtpUsed: 'mock' };
        }

        // TODO: Implement real email sending with nodemailer or resend
        // const transporter = nodemailer.createTransport({
        //     host: smtp.host,
        //     port: smtp.port,
        //     auth: { user: smtp.user, pass: smtp.password }
        // });
        // await transporter.sendMail({
        //     from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
        //     to: options.to,
        //     subject: options.subject,
        //     html: options.html
        // });

        console.log(`[EMAIL MOCK] Would send via ${smtp.fromName} <${smtp.fromEmail}>:`, options.subject);
        return { success: true, smtpUsed: smtp.fromName };

    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send community invitation email
 */
export async function sendInvitationEmail(
    tenantId: string,
    inviterName: string,
    communityName: string,
    inviteeEmail: string,
    inviteeName: string | null,
    role: string,
    inviteToken: string,
    personalMessage?: string
) {
    const joinUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://isolate.community'}/join/${inviteToken}`;
    const greeting = inviteeName ? `Hi ${inviteeName}` : 'Hello';

    return sendEmail({
        to: inviteeEmail,
        subject: `You're invited to join ${communityName}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
                <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="color: #7c3aed; margin-bottom: 16px;">You've Been Invited! 🎉</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        ${greeting},<br><br>
                        <strong>${inviterName}</strong> has invited you to join <strong>${communityName}</strong> on Isolate Community.
                    </p>
                    
                    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            <strong>Your Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}
                        </p>
                    </div>
                    
                    ${personalMessage ? `
                    <div style="border-left: 3px solid #7c3aed; padding-left: 16px; margin: 24px 0;">
                        <p style="color: #6b7280; font-style: italic; margin: 0;">
                            "${personalMessage}"<br>
                            <span style="color: #9ca3af; font-size: 12px;">— ${inviterName}</span>
                        </p>
                    </div>
                    ` : ''}
                    
                    <a href="${joinUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Accept Invitation
                    </a>
                    
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                        This invitation will expire in 7 days.<br>
                        If you didn't expect this, you can safely ignore this email.
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                    Isolate Community Platform<br>
                    © 2026 All rights reserved
                </p>
            </div>
        `,
        text: `${greeting}, ${inviterName} has invited you to join ${communityName}. Your role: ${role}. Accept at: ${joinUrl}`
    }, { tenantId, purpose: 'welcome' });
}

/**
 * Send community welcome email (after accepting invitation)
 */
export async function sendCommunityWelcomeEmail(
    tenantId: string,
    communityName: string,
    userEmail: string,
    userName?: string
) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://isolate.community'}/dashboard`;
    const greeting = userName ? `Welcome, ${userName}` : 'Welcome';

    return sendEmail({
        to: userEmail,
        subject: `Welcome to ${communityName}! 🎊`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
                <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="color: #7c3aed; margin-bottom: 16px;">${greeting}! 👋</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        You've successfully joined <strong>${communityName}</strong>!
                    </p>
                    
                    <h3 style="color: #111827; margin-top: 24px;">What you can do:</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>Connect with community members</li>
                        <li>Access community notices & events</li>
                        <li>Use the help desk for support</li>
                        <li>Chat with Cora, the AI assistant</li>
                    </ul>
                    
                    <a href="${dashboardUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Go to Dashboard
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                    ${communityName} on Isolate Community Platform
                </p>
            </div>
        `,
        text: `${greeting}! You've joined ${communityName}. Go to dashboard: ${dashboardUrl}`
    }, { tenantId, purpose: 'welcome' });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
    return sendEmail({
        to: email,
        subject: 'Reset Your Password - Isolate Community',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                <a href="${resetLink}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px;">
                    Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    Isolate Support<br>
                    © 2026 All rights reserved
                </p>
            </div>
        `,
        text: `Password Reset Request\n\nClick this link to reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
    }, { purpose: 'support' });
}

/**
 * Send chat transcript email
 */
export async function sendChatTranscriptEmail(email: string, transcript: string, tenantId?: string) {
    return sendEmail({
        to: email,
        subject: 'Your Chat Transcript - Isolate Community',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Chat Transcript</h2>
                <p>Here's your conversation with Cora, the Community Assistant:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; font-family: monospace; font-size: 13px;">
                    ${transcript.replace(/\n/g, '<br>')}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    Isolate Support<br>
                    © 2026 All rights reserved
                </p>
            </div>
        `,
        text: `Chat Transcript\n\n${transcript}`
    }, { tenantId, purpose: 'transactional' });
}

/**
 * Send platform welcome email (no community yet)
 */
export async function sendWelcomeEmail(email: string, userName?: string) {
    const greeting = userName ? `Hi ${userName}` : 'Welcome';

    return sendEmail({
        to: email,
        subject: 'Welcome to Isolate Community!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">${greeting}! 👋</h2>
                <p>Welcome to Isolate Community, your passport to diverse communities worldwide.</p>
                <h3>Getting Started:</h3>
                <ul>
                    <li>Create or join a community</li>
                    <li>Connect with members</li>
                    <li>Access community features</li>
                    <li>Chat with Cora, your AI assistant</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/onboarding" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px;">
                    Get Started
                </a>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    Isolate Support<br>
                    © 2026 All rights reserved
                </p>
            </div>
        `,
        text: `${greeting}!\n\nWelcome to Isolate Community. Get started at ${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
    }, { purpose: 'welcome' });
}
