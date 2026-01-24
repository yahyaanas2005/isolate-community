-- Feature 25: Moderation & Content Safety
-- Run this in Supabase SQL Editor

-- Clean Up
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_reason CASCADE;

-- Enums
CREATE TYPE report_reason AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- 1. Content Reports
-- Users report content (posts, comments, events, etc.)
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    
    -- Polymorphic relationship to content
    content_type TEXT NOT NULL, -- 'POST', 'COMMENT', 'EVENT', 'USER'
    content_id UUID NOT NULL,   -- The ID of the item being reported
    
    reason report_reason NOT NULL,
    description TEXT,
    
    status report_status DEFAULT 'PENDING',
    priority_score INTEGER DEFAULT 0, -- Calculated based on reporter trusts, dupes, etc.
    
    assigned_to UUID REFERENCES memberships(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Moderation Logs
-- Audit trail of actions taken by admins
CREATE TABLE moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES content_reports(id) ON DELETE SET NULL,
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    moderator_id UUID REFERENCES memberships(id),
    action TEXT NOT NULL, -- 'DELETE_CONTENT', 'BAN_USER', 'DISMISS_REPORT'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Reporting:
-- Members can create reports
-- Admins/Mods can view all reports for their community
CREATE POLICY "Members create reports" ON content_reports
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE id = reporter_id AND user_id = auth.uid())
);

CREATE POLICY "Admins view reports" ON content_reports
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin', 'Moderator'))
);

CREATE POLICY "Admins update reports" ON content_reports
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin', 'Moderator'))
);

-- Logs:
-- Admins view logs
CREATE POLICY "Admins view logs" ON moderation_logs
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin', 'Moderator'))
);
