-- Cluster 6: Governance (Committees & Meetings)
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. COMMITTEES
-- ==========================================

DROP TABLE IF EXISTS action_items CASCADE;
DROP TABLE IF EXISTS meeting_minutes CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS committee_members CASCADE;
DROP TABLE IF EXISTS committees CASCADE;

CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Finance Committee", "Social Committee"
    description TEXT,
    charter_url TEXT, -- Link to document
    is_public BOOLEAN DEFAULT TRUE, -- If false, only members see it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER' CHECK (role IN ('CHAIR', 'SECRETARY', 'MEMBER')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(committee_id, user_id)
);

-- ==========================================
-- 2. MEETINGS & MINUTES
-- ==========================================

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT, -- "Clubhouse" or "Zoom Link"
    agenda TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Markdown/Rich text
    recorded_by UUID REFERENCES memberships(id),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to UUID REFERENCES memberships(id),
    due_date DATE,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Committees: Public read (if public), Admins manage
CREATE POLICY "Public view committees" ON committees FOR SELECT USING (
    (is_public = true) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = committees.community_id)
);
CREATE POLICY "Admins manage committees" ON committees FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = committees.community_id AND role IN ('Owner', 'Admin'))
);

-- Committee Members:
CREATE POLICY "View committee members" ON committee_members FOR SELECT USING (true);
CREATE POLICY "Admins manage members" ON committee_members FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = (SELECT community_id FROM committees WHERE id = committee_members.committee_id) AND role IN ('Owner', 'Admin'))
);

-- Meetings:
CREATE POLICY "View meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Committee officers manage meetings" ON meetings FOR ALL USING (
    EXISTS (SELECT 1 FROM committee_members WHERE committee_id = meetings.committee_id AND user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) AND role IN ('CHAIR', 'SECRETARY')) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = (SELECT community_id FROM committees WHERE id = meetings.committee_id) AND role IN ('Owner', 'Admin'))
);

-- Minutes: Published read only, Officers write
CREATE POLICY "View published minutes" ON meeting_minutes FOR SELECT USING (is_published = true OR 
    -- Allow members/officers to see drafts
    EXISTS (SELECT 1 FROM committee_members WHERE committee_id = (SELECT committee_id FROM meetings WHERE id = meeting_minutes.meeting_id) AND user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);
