-- Features 19-22: Advanced Modules
-- Run this in Supabase SQL Editor

-- Clean up
DROP TABLE IF EXISTS feedback_items CASCADE;
DROP TABLE IF EXISTS roadmap_votes CASCADE;
DROP TABLE IF EXISTS roadmaps CASCADE;
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP VIEW IF EXISTS analytics_daily_metrics CASCADE;
DROP TABLE IF EXISTS community_languages CASCADE;
DROP TABLE IF EXISTS language_preferences CASCADE;

-- ============================================
-- FEATURE 19: Multilingual (i18n)
-- ============================================

CREATE TABLE language_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_language TEXT NOT NULL DEFAULT 'en', -- en, es, fr, ar, hi
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE community_languages (
    community_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    primary_language TEXT NOT NULL DEFAULT 'en',
    supported_languages JSONB DEFAULT '["en"]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own lang prefs" ON language_preferences
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Community members view lang settings" ON community_languages
FOR SELECT USING (true); -- Public read for UI rendering

CREATE POLICY "Admins manage lang settings" ON community_languages
FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

-- ============================================
-- FEATURE 20: Advanced Analytics
-- ============================================

-- Analytics Views (Simplified for MVP)
CREATE OR REPLACE VIEW analytics_daily_metrics AS
SELECT 
    tenant_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) FILTER (WHERE role = 'Member') as new_members,
    COUNT(*) as total_actions -- Placeholder
FROM memberships
GROUP BY tenant_id, DATE_TRUNC('day', created_at);

-- ============================================
-- FEATURE 21: Integrations (Mailchimp, Tally)
-- ============================================

CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'MAILCHIMP', 'TALLY'
    config JSONB DEFAULT '{}'::jsonb, -- API Keys, List IDs (encrypted ideally)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    status TEXT NOT NULL, -- 'SUCCESS', 'ERROR'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage integrations" ON integration_configs
FOR ALL USING (
   EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')) 
);

CREATE POLICY "Admins view integration logs" ON integration_logs
FOR SELECT USING (
   EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')) 
);

-- ============================================
-- FEATURE 22: Public Roadmap & Feedback
-- ============================================

CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED')),
    target_date DATE,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roadmap_votes (
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (roadmap_id, user_id)
);

CREATE TABLE feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'OPEN',
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;

-- Roadmap: Visible to all members
CREATE POLICY "Members view roadmap" ON roadmaps
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)
);

CREATE POLICY "Admins manage roadmap" ON roadmaps
FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

-- Votes: Members can vote once
CREATE POLICY "Members manage own votes" ON roadmap_votes
FOR ALL USING (auth.uid() = user_id);

-- Feedback: Members create, Admins manage
CREATE POLICY "Members create feedback" ON feedback_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members view feedback" ON feedback_items
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)
);
