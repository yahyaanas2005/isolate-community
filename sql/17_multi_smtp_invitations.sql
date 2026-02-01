-- =============================================
-- Multi-Tenant Email System & Invitation Schema
-- =============================================
-- Run this after 15_auth_profile_trigger.sql and 16_system_settings.sql

-- =============================================
-- 1. Platform SMTP Pool (Super Admin's multiple SMTPs)
-- =============================================
CREATE TABLE IF NOT EXISTS platform_smtp_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL, -- "North America SMTP", "EU SMTP", "Welcome Emails"
    smtp_host text NOT NULL,
    smtp_port integer DEFAULT 587,
    smtp_user text NOT NULL,
    smtp_password text NOT NULL,
    smtp_from_email text NOT NULL,
    smtp_from_name text DEFAULT 'Isolate Support',
    is_default boolean DEFAULT false,
    enabled boolean DEFAULT true,
    region text, -- 'us', 'eu', 'asia', null for global
    purpose text, -- 'welcome', 'support', 'transactional', null for all
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure only one default SMTP
CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_smtp_single_default 
ON platform_smtp_accounts (is_default) WHERE is_default = true;

-- =============================================
-- 2. Community-Level SMTP Settings
-- =============================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_host text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_port integer DEFAULT 587;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_user text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_password text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_from_email text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_from_name text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_enabled boolean DEFAULT false;

-- =============================================
-- 3. User-Level SMTP Settings (Optional)
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_host text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_port integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_user text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_password text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_enabled boolean DEFAULT false;

-- =============================================
-- 4. Sub-Admin Role for Support Assistants
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_sub_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assigned_regions text[]; -- ['us', 'eu'] for regional support

-- =============================================
-- 5. Community Invitations Table
-- =============================================
CREATE TABLE IF NOT EXISTS community_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    invited_by uuid REFERENCES profiles(id),
    invitee_email text NOT NULL,
    invitee_name text,
    role text DEFAULT 'member', -- member, staff, admin
    status text DEFAULT 'pending', -- pending, accepted, rejected, expired
    invite_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    message text, -- Optional personal message from inviter
    expires_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz DEFAULT now(),
    accepted_at timestamptz,
    UNIQUE(tenant_id, invitee_email)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON community_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON community_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON community_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON community_invitations(tenant_id);

-- =============================================
-- 6. RLS Policies
-- =============================================

-- Platform SMTP: Only super/sub admins
ALTER TABLE platform_smtp_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support team can manage platform SMTP"
ON platform_smtp_accounts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.is_super_admin = true OR profiles.is_sub_admin = true)
    )
);

-- Community Invitations: Visible to inviter, invitee, and community admins
ALTER TABLE community_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or community invitations"
ON community_invitations FOR SELECT
USING (
    invited_by = auth.uid() 
    OR invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.tenant_id = community_invitations.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Admins can create invitations"
ON community_invitations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.tenant_id = community_invitations.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Invitee can update invitation status"
ON community_invitations FOR UPDATE
USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.tenant_id = community_invitations.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'admin')
    )
);

-- =============================================
-- 7. Insert Default Platform SMTP (if none exists)
-- =============================================
INSERT INTO platform_smtp_accounts (name, smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, is_default, purpose)
SELECT 'Default Platform SMTP', 'smtp.gmail.com', 587, '', '', 'support@isolate.com', true, 'all'
WHERE NOT EXISTS (SELECT 1 FROM platform_smtp_accounts WHERE is_default = true);

-- =============================================
-- NOTE: Run this script in Supabase SQL Editor
-- After running, set yourself as super admin:
-- UPDATE profiles SET is_super_admin = true WHERE email = 'your-email@example.com';
-- =============================================
