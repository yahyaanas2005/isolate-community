-- Cluster 5: NOC/NDC Request Workflows
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. REQUEST TYPES & WORKFLOWS
-- ==========================================

DROP TABLE IF EXISTS request_approvals CASCADE;
DROP TABLE IF EXISTS member_requests CASCADE;
DROP TABLE IF EXISTS request_types CASCADE;

CREATE TABLE request_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Move In NOC", "Renovation Permit"
    description TEXT,
    requires_fee BOOLEAN DEFAULT FALSE,
    fee_amount NUMERIC(10, 2) DEFAULT 0,
    required_fields JSONB DEFAULT '[]'::jsonb, -- Array of field definitions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE member_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES request_types(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PAYMENT_PENDING')),
    form_data JSONB DEFAULT '{}'::jsonb, -- dynamic fields
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE request_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES member_requests(id) ON DELETE CASCADE,
    approver_role TEXT NOT NULL, -- 'Admin', 'Finance', 'Security'
    approver_user_id UUID REFERENCES memberships(id),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_approvals ENABLE ROW LEVEL SECURITY;

-- Request Types: Public read, Admin manage
CREATE POLICY "Public view request types" ON request_types FOR SELECT USING (true);
CREATE POLICY "Admins manage request types" ON request_types FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = request_types.community_id AND role IN ('Owner', 'Admin'))
);

-- Requests: Creator views/edits own, Admins view all
CREATE POLICY "Creator manage own requests" ON member_requests FOR ALL USING (
    created_by IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Admins view all requests" ON member_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = member_requests.community_id AND role IN ('Owner', 'Admin', 'Staff'))
);

-- Approvals: Admins manage
CREATE POLICY "Admins manage approvals" ON request_approvals FOR ALL USING (
    EXISTS (SELECT 1 FROM member_requests WHERE id = request_approvals.request_id AND 
        EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = member_requests.community_id AND role IN ('Owner', 'Admin', 'Staff')))
);
