-- Cluster 9: Marketing
-- Run this in Supabase SQL Editor

DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS campaign_segments CASCADE;

CREATE TABLE campaign_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    criteria JSONB, -- e.g. { "role": "owner", "move_in_after": "2023-01-01" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    content TEXT, -- HTML content
    segment_id UUID REFERENCES campaign_segments(id),
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENT', 'ARCHIVED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns" ON campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = campaigns.community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "Admins manage segments" ON campaign_segments FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = campaign_segments.community_id AND role IN ('Owner', 'Admin'))
);

-- Cluster 3: Help Board (Tickets)

DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_categories CASCADE;

CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Maintenance", "Billing", "IT Support"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ticket_categories(id),
    created_by UUID NOT NULL REFERENCES memberships(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_to UUID REFERENCES memberships(id), -- Staff member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ticket categories" ON ticket_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = ticket_categories.community_id AND role IN ('Owner', 'Admin'))
);
CREATE POLICY "Public view ticket categories" ON ticket_categories FOR SELECT USING (true);

-- Tickets: 
-- 1. Creator sees own
-- 2. Admins/Staff see all
CREATE POLICY "Creator manage own tickets" ON tickets FOR ALL USING (
    created_by IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Staff view all tickets" ON tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = tickets.community_id AND role IN ('Owner', 'Admin', 'Staff'))
);
