-- ============================================================================
-- PART 7: SECURITY & VISITOR MANAGEMENT (GATEKEEPER)
-- ============================================================================

-- 7.1 GATES (Entry Points)
CREATE TABLE IF NOT EXISTS gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Main Gate", "Back Gate"
    code TEXT,
    location_lat DECIMAL,
    location_lng DECIMAL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 7.2 FREQUENT VISITORS (Optional, helps autocomplete)
CREATE TABLE IF NOT EXISTS frequent_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resident_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_no TEXT,
    category TEXT DEFAULT 'guest' CHECK (category IN ('guest', 'family', 'staff', 'delivery', 'cab')),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.3 VISITOR PASSES (The Invite)
CREATE TABLE IF NOT EXISTS visitor_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pass_code TEXT UNIQUE NOT NULL, -- The text for QR code
    
    invited_by UUID NOT NULL REFERENCES profiles(id), -- Resident
    unit_id UUID REFERENCES units(id),
    
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_vehicle_no TEXT,
    visitor_count INT DEFAULT 1,
    visitor_type TEXT DEFAULT 'guest' CHECK (visitor_type IN ('guest', 'delivery', 'cab', 'staff', 'service')),
    
    visit_type TEXT DEFAULT 'one_time' CHECK (visit_type IN ('one_time', 'multi_entry', 'recurring')),
    
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled', 'revoked')),
    
    share_link TEXT, -- Optional short link
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.4 GATE LOGS (Entry/Exit History)
CREATE TABLE IF NOT EXISTS gate_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    gate_id UUID REFERENCES gates(id),
    guard_user_id UUID REFERENCES profiles(id), -- Which guard scanned it
    
    pass_id UUID REFERENCES visitor_passes(id),
    
    action TEXT NOT NULL CHECK (action IN ('entry', 'exit', 'denied')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    vehicle_no_captured TEXT, -- If OCR used or manual entry differ from pass
    visitor_photo_captured TEXT, -- If guard takes photo
    
    notes TEXT
);

-- 7.5 PARKING SPOTS
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "B1 Sidebar"
    total_slots INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES parking_lots(id),
    slot_no TEXT NOT NULL,
    
    is_reserved BOOLEAN DEFAULT false,
    assigned_to_unit UUID REFERENCES units(id),
    
    current_status TEXT DEFAULT 'empty' CHECK (current_status IN ('empty', 'occupied', 'banned')),
    current_vehicle_no TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slot_no)
);

-- 7.6 GUARD PATROLS
CREATE TABLE IF NOT EXISTS patrol_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- QR code at physical location
    location_lat DECIMAL,
    location_lng DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patrol_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES patrol_checkpoints(id),
    guard_user_id UUID NOT NULL REFERENCES profiles(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'ok' CHECK (status IN ('ok', 'issue_reported')),
    notes TEXT,
    photo_url TEXT
);


-- RLS
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified)
-- 1. Residents can see relevant data
CREATE POLICY "Residents can view gates" ON gates FOR SELECT USING (true);
CREATE POLICY "Residents manage their frequent visitors" ON frequent_visitors 
    USING (resident_user_id = auth.uid());
CREATE POLICY "Residents manage their invites" ON visitor_passes 
    USING (invited_by = auth.uid());

-- 2. Staff/Guards can view all passes (Role based is better, but MVP: authenticated users in tenant can view passes? No, separate for privacy)
-- For MVP, we allow 'security' role to view all.
-- Using 'exists' check is expensive in RLS sometimes.
-- For now, let's allow: Residents view OWN. Guards view ALL.
-- Assuming 'auth.uid()' logic handles roles later or we skip strict RLS in MVP and use permissions table check in App logic.
-- Actually, we'll keep it open for tenant users for MVP convenience or rely on service_role for guards.

CREATE POLICY "Tenant users view logs" ON gate_logs 
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid()));

-- Done.
