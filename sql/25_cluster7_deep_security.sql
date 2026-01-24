-- Cluster 7: Deep Security & Guard Features
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. PATROLLING SYSTEM
-- ==========================================

DROP TABLE IF EXISTS checkpoint_logs CASCADE;
DROP TABLE IF EXISTS patrol_runs CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;
DROP TABLE IF EXISTS patrol_routes CASCADE;

-- Routes defined by Admins
CREATE TABLE patrol_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkpoints (Physical locations with QR codes)
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES patrol_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    qr_code_data TEXT NOT NULL, -- The string encoded in the QR code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A specific instance of a patrol (A guard walking the route)
CREATE TABLE patrol_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES patrol_routes(id) ON DELETE CASCADE,
    guard_user_id UUID NOT NULL REFERENCES profiles(id), -- Assuming profiles or auth.users logic
    status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABORTED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Logs of checking into a specific checkpoint
CREATE TABLE checkpoint_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES patrol_runs(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gps_lat DOUBLE PRECISION, -- Verification GPS
    gps_lng DOUBLE PRECISION,
    status TEXT NOT NULL CHECK (status IN ('SCANNED', 'SKIPPED', 'ISSUE_REPORTED')), 
    note TEXT
);

-- ==========================================
-- 2. PARKING MANAGEMENT
-- ==========================================

DROP TABLE IF EXISTS visitor_parking_log CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;

CREATE TABLE parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slot_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('RESIDENT', 'VISITOR', 'RESERVED', 'DISABLED')),
    is_allocated BOOLEAN DEFAULT FALSE,
    assigned_unit_id UUID, -- Optional link to a specific unit/user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Linking visitor passes to parking slots
CREATE TABLE visitor_parking_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    visitor_pass_id UUID REFERENCES visitor_passes(id) ON DELETE SET NULL,
    slot_id UUID NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- Alter existing visitor_passes to support approval workflow (Intercom)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_passes' AND column_name = 'approval_status') THEN
        ALTER TABLE visitor_passes ADD COLUMN approval_status TEXT DEFAULT 'APPROVED' CHECK (approval_status IN ('PENDING', 'APPROVED', 'DENIED'));
    END IF;
END $$;


-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

ALTER TABLE patrol_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_parking_log ENABLE ROW LEVEL SECURITY;

-- Patrol Routes: Admins manage, Guards read
CREATE POLICY "Admins manage routes" ON patrol_routes FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = patrol_routes.community_id AND role IN ('Owner', 'Admin'))
);
CREATE POLICY "Guards view routes" ON patrol_routes FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = patrol_routes.community_id AND role IN ('Guard', 'Staff', 'Owner', 'Admin'))
);

-- Checkpoints: Same as routes
CREATE POLICY "Admins manage checkpoints" ON checkpoints FOR ALL USING (
    EXISTS (SELECT 1 FROM patrol_routes WHERE id = checkpoints.route_id AND 
        EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = patrol_routes.community_id AND role IN ('Owner', 'Admin')))
);
CREATE POLICY "Guards view checkpoints" ON checkpoints FOR SELECT USING (
    EXISTS (SELECT 1 FROM patrol_routes WHERE id = checkpoints.route_id AND 
        EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = patrol_routes.community_id AND role IN ('Guard', 'Staff', 'Owner', 'Admin')))
);

-- Patrol Runs: Guards insert their own, Admins view all
CREATE POLICY "Guards manage own runs" ON patrol_runs FOR ALL USING (
    guard_user_id = auth.uid()
);
CREATE POLICY "Admins view runs" ON patrol_runs FOR SELECT USING (
    EXISTS (SELECT 1 FROM patrol_routes WHERE id = patrol_runs.route_id AND 
        EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = patrol_routes.community_id AND role IN ('Owner', 'Admin')))
);

-- Logs: Guards insert
CREATE POLICY "Guards insert logs" ON checkpoint_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM patrol_runs WHERE id = checkpoint_logs.run_id AND guard_user_id = auth.uid())
);
CREATE POLICY "View logs" ON checkpoint_logs FOR SELECT USING (true); -- Broad view ok for audit

-- Parking: Admins manage, Everyone reads (to see availability)
CREATE POLICY "Admins manage parking" ON parking_slots FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = parking_slots.community_id AND role IN ('Owner', 'Admin'))
);
CREATE POLICY "Public view parking" ON parking_slots FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = parking_slots.community_id)
);

CREATE POLICY "Guards manage visitor parking" ON visitor_parking_log FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = visitor_parking_log.community_id AND role IN ('Guard', 'Staff', 'Owner', 'Admin'))
);
