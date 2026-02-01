-- =============================================
-- System Settings Table
-- Store global platform settings like SMTP credentials
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- SMTP Configuration
    smtp_host text,
    smtp_port integer DEFAULT 587,
    smtp_user text,
    smtp_password text, -- Will be encrypted in production
    smtp_from_email text,
    smtp_from_name text DEFAULT 'Isolate Community Platform',
    smtp_enabled boolean DEFAULT false,
    
    -- Additional Settings
    platform_name text DEFAULT 'Isolate',
    support_email text,
    max_tenants integer DEFAULT 1000,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert default row (only one row should exist)
INSERT INTO system_settings (smtp_from_name) 
VALUES ('Isolate Community Platform')
ON CONFLICT DO NOTHING;

-- =============================================
-- Super Admin Flag in Profiles
-- =============================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- TODO: Manually set your email as super admin after running this script
-- UPDATE profiles SET is_super_admin = true WHERE email = 'your-email@example.com';

-- =============================================
-- RLS Policies for System Settings
-- =============================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can view/edit system settings
CREATE POLICY "Super admins can manage system settings"
ON system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);
