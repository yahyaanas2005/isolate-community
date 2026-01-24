-- Deep Dive Cluster 3: Help Desk Advanced Schema
-- Run this in Supabase SQL Editor

-- 1. TICKET RATINGS (Satisfaction) ⭐️
CREATE TABLE ticket_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ticket_id) -- One rating per ticket
);

-- 2. TOWER & UNIT STRATEGIES (For Reports) 🏢
-- We need to link tickets to specific Units/Towers if not already
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS unit_id TEXT, -- e.g. "Tower A - 101"
ADD COLUMN IF NOT EXISTS tower TEXT;    -- e.g. "Tower A"

-- 3. ESCALATION MATRIX 📈
-- Rules for auto-assignment or SLA breaches
CREATE TABLE escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ticket_categories(id),
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    escalate_to_role TEXT, -- e.g. "Chief Security", "Maintenance Head"
    sla_hours INTEGER, -- e.g. 4 hours to resolve
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAFF ROSTER (Shift Management) 📅
CREATE TABLE staff_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id),
    shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_end TIMESTAMP WITH TIME ZONE NOT NULL,
    role TEXT, -- "Plumber", "Electrician"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE ticket_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_rosters ENABLE ROW LEVEL SECURITY;

-- Ratings: Public read (for agg reports), but only Ticket Creator can insert
CREATE POLICY "View ratings" ON ticket_ratings FOR SELECT USING (true);
CREATE POLICY "Rate own ticket" ON ticket_ratings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND created_by IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);

-- Escalations & Rosters: Admins manage, Staff view
CREATE POLICY "Admins manage rules" ON escalation_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);
