-- Feature 23: Automation & Workflows
-- Feature 24: Reputation & Trust
-- Run this in Supabase SQL Editor

-- ==========================================
-- 23. AUTOMATION SYSTEM
-- ==========================================

DROP TABLE IF EXISTS workflow_logs CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TYPE IF EXISTS workflow_trigger_type CASCADE;
DROP TYPE IF EXISTS workflow_action_type CASCADE;

CREATE TYPE workflow_trigger_type AS ENUM (
    'MEMBER_JOINED',
    'POST_CREATED',
    'TICKET_CREATED',
    'PAYMENT_RECEIVED'
);

CREATE TYPE workflow_action_type AS ENUM (
    'SEND_EMAIL',
    'ASSIGN_ROLE',
    'CREATE_TASK',
    'POST_MESSAGE'
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    trigger_type workflow_trigger_type NOT NULL,
    action_type workflow_action_type NOT NULL,
    
    -- Configuration for the action (e.g. email template, role ID)
    action_config JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'SUCCESS', 'FAILED'
    details TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage workflows" ON workflows
FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = workflows.community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "Admins view logs" ON workflow_logs
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = workflow_logs.community_id AND role IN ('Owner', 'Admin'))
);

-- ==========================================
-- 24. REPUTATION SYSTEM
-- ==========================================

DROP TABLE IF EXISTS member_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS reputation_events CASCADE;

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name or URL
    color TEXT,
    min_reputation INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE member_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store reputation score directly on memberships for speed, 
-- but keep a log of events for audit
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

CREATE TABLE reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'POST_LIKED', 'ATTENDED_EVENT', 'HELPFUL_COMMENT'
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admins manage badges" ON badges FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = badges.community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "Public view member badges" ON member_badges FOR SELECT USING (true);

-- Trigger to update reputation score
CREATE OR REPLACE FUNCTION update_reputation_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE memberships
    SET reputation_score = reputation_score + NEW.points
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_reputation
AFTER INSERT ON reputation_events
FOR EACH ROW
EXECUTE FUNCTION update_reputation_score();
