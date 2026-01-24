-- Cluster 4: Violations & Fines
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. VIOLATIONS
-- ==========================================

DROP TABLE IF EXISTS fines CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS violation_types CASCADE;

CREATE TABLE violation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Noise Complaint", "Improper Trash Disposal"
    description TEXT,
    default_fine_amount NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES violation_types(id),
    reported_by UUID NOT NULL REFERENCES memberships(id),
    
    -- The target of the violation (can be a user, a specific unit, or unknown)
    against_user_id UUID REFERENCES memberships(id),
    location_description TEXT, -- e.g. "Unit 404" or "Pool Area"
    
    description TEXT NOT NULL,
    proof_files TEXT[], -- Array of Supabase Storage paths
    
    severity TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    violation_id UUID NOT NULL REFERENCES violations(id) ON DELETE CASCADE,
    issued_to_user_id UUID NOT NULL REFERENCES memberships(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    due_date DATE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE violation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;

-- Types: Public read (for reporting form), Admins manage
CREATE POLICY "Public view violation types" ON violation_types FOR SELECT USING (true);
CREATE POLICY "Admins manage violation types" ON violation_types FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = violation_types.community_id AND role IN ('Owner', 'Admin'))
);

-- Violations:
-- 1. Reporter sees their own reports
-- 2. Accused sees reports against them (if Admin decides to show them? Usually yes for fairness, or maybe only if a fine is issued. Let's start with transparency)
-- 3. Admins/Staff see all
CREATE POLICY "View relevant violations" ON violations FOR SELECT USING (
    reported_by IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    against_user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = violations.community_id AND role IN ('Owner', 'Admin', 'Staff', 'Guard'))
);

CREATE POLICY "Report violation" ON violations FOR INSERT WITH CHECK (
    reported_by IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Admins update violations" ON violations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = violations.community_id AND role IN ('Owner', 'Admin', 'Staff'))
);

-- Fines:
-- 1. Payer sees their fines
-- 2. Admins manage
CREATE POLICY "User views own fines" ON fines FOR SELECT USING (
    issued_to_user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Admins manage fines" ON fines FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = fines.community_id AND role IN ('Owner', 'Admin'))
);
