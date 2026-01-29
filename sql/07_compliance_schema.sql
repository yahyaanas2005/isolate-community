-- ============================================================================
-- PART 10: COMPLIANCE & DOCUMENTS
-- ============================================================================

-- 10.1 VIOLATIONS (Rule Breaking)
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    reported_by UUID REFERENCES profiles(id),
    
    offender_unit_id UUID REFERENCES units(id), -- If known
    offender_name TEXT, -- If manual entry
    
    type TEXT NOT NULL CHECK (type IN ('noise', 'parking', 'trash', 'pet', 'construction', 'behavior', 'other')),
    details TEXT,
    evidence_urls JSONB DEFAULT '[]',
    
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_review', 'warning_sent', 'fined', 'resolved', 'dismissed')),
    
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2 DOCUMENTS (Repository)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('bylaws', 'minutes', 'forms', 'financials', 'notices', 'general')),
    
    file_url TEXT NOT NULL,
    file_type TEXT, -- pdf, img
    
    is_public BOOLEAN DEFAULT true, -- Visible to all residents
    
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Residents view public docs" ON documents FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid()) 
    AND is_public = true
);

CREATE POLICY "Residents view own violations reports" ON violations FOR SELECT USING (
    reported_by = auth.uid()
);
-- Admins view all (Service role or implicit)

-- Done.
