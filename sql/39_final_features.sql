-- Feature 39: Final Feature Set (Security Advanced, Accounting Advanced, Amenities)
-- Run this in Supabase SQL Editor

-- Clean up previous runs
DROP TABLE IF EXISTS patrol_logs CASCADE;
DROP TABLE IF EXISTS patrol_routes CASCADE;
DROP TABLE IF EXISTS logistics_entries CASCADE;
DROP TABLE IF EXISTS gate_passes CASCADE;
DROP TABLE IF EXISTS parcels CASCADE;
DROP TABLE IF EXISTS invite_requests CASCADE;
DROP TABLE IF EXISTS child_exit_logs CASCADE;
DROP TABLE IF EXISTS credit_notes CASCADE;
DROP TABLE IF EXISTS fixed_deposits CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS amenity_bookings CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;

-- ==========================================
-- 1. ADVANCED SECURITY 🛡️
-- ==========================================

-- A. GUARD PATROLLING
CREATE TABLE patrol_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Perimeter Walk"
    checkpoints JSONB DEFAULT '[]'::jsonb, -- Array of { "name": "North Gate", "nfc_code": "XYZ", "lat": 1.1, "lng": 2.2 }
    frequency TEXT, -- "Hourly", "Nightly"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE patrol_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES patrol_routes(id) ON DELETE CASCADE,
    guard_id UUID REFERENCES security_guard_profiles(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    checkpoint_hits JSONB DEFAULT '[]'::jsonb, -- Log of scanned points
    status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'INCOMPLETE'))
);

-- B. LOGISTICS (Tankers, Garbage)
CREATE TABLE logistics_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('WATER_TANKER', 'DIESEL_TANKER', 'GARBAGE_TRUCK', 'OTHER')),
    vendor_name TEXT,
    vehicle_number TEXT,
    driver_name TEXT,
    capacity_liters NUMERIC, -- Only for Water/Diesel
    quantity_in NUMERIC,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES memberships(id)
);

-- C. MATERIAL GATE PASS (In/Out)
CREATE TABLE gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('MATERIAL_IN', 'MATERIAL_OUT')),
    items TEXT NOT NULL, -- Description of items
    carrier_name TEXT, -- Person carrying it
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    approved_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. PARCEL MANAGEMENT (Leave at Gate)
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
    unit_number TEXT, -- Fallback if user not found
    carrier TEXT, -- "Amazon", "DHL"
    image_url TEXT,
    status TEXT DEFAULT 'AT_GATE' CHECK (status IN ('AT_GATE', 'COLLECTED', 'RETURNED')),
    collected_at TIMESTAMP WITH TIME ZONE,
    collection_otp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E. INVITE SEEKING
CREATE TABLE invite_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requester_phone TEXT NOT NULL,
    requested_host_id UUID NOT NULL REFERENCES memberships(id),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. CHILD EXIT TRACKING
CREATE TABLE child_exit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES memberships(id),
    child_name TEXT NOT NULL,
    escorted_by TEXT, -- "Driver", "Nanny"
    exit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    guard_id UUID REFERENCES security_guard_profiles(id)
);

ALTER TABLE patrol_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_exit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage patrols" ON patrol_routes FOR ALL USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner','Admin')));
CREATE POLICY "Guards view patrols" ON patrol_routes FOR SELECT USING (EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid() AND community_id = patrol_routes.community_id));
CREATE POLICY "Guards log patrols" ON patrol_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Guards manage logistics" ON logistics_entries FOR ALL USING (EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid() AND community_id = logistics_entries.community_id));
CREATE POLICY "Admins view logistics" ON logistics_entries FOR SELECT USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')));

CREATE POLICY "Users manage own gate passes" ON gate_passes FOR ALL USING (user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()));
CREATE POLICY "Guards view gate passes" ON gate_passes FOR SELECT USING (EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid() AND community_id = gate_passes.community_id));

CREATE POLICY "Guards manage parcels" ON parcels FOR ALL USING (EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid() AND community_id = parcels.community_id));
CREATE POLICY "Users view own parcels" ON parcels FOR SELECT USING (recipient_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()));

-- ==========================================
-- 2. ADVANCED ACCOUNTING 💰
-- ==========================================

-- A. CREDIT NOTES
CREATE TABLE credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES memberships(id),
    invoice_id UUID REFERENCES invoices(id), -- Optional link to original invoice
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_used BOOLEAN DEFAULT FALSE -- Or track balance
);

-- B. FIXED DEPOSITS
CREATE TABLE fixed_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT,
    principal_amount NUMERIC(14, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. BUDGETS
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    category_id UUID REFERENCES ledger_accounts(id), -- Link to GL Account
    amount_allocated NUMERIC(14, 2) NOT NULL,
    amount_spent NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage finance tables" ON credit_notes FOR ALL USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')));

-- ==========================================
-- 3. AMENITIES & BOOKINGS 🏸
-- ==========================================

CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Tennis Court", "Clubhouse Hall"
    description TEXT,
    hourly_rate NUMERIC(10, 2) DEFAULT 0,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE amenity_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Users book amenities" ON amenity_bookings FOR INSERT WITH CHECK (user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()));
CREATE POLICY "Users view own bookings" ON amenity_bookings FOR SELECT USING (user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()));
