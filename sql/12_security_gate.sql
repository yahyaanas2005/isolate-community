-- Feature 12: Security & Gate Management
-- Run this in Supabase SQL Editor

-- Clean Up
DROP TABLE IF EXISTS vehicle_access_logs CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS daily_help_access_logs CASCADE;
DROP TABLE IF EXISTS daily_helps CASCADE;
DROP TABLE IF EXISTS visitor_passes CASCADE;
DROP TABLE IF EXISTS security_guard_profiles CASCADE;

DROP TYPE IF EXISTS help_status CASCADE;
DROP TYPE IF EXISTS help_type CASCADE;
DROP TYPE IF EXISTS visit_status CASCADE;
DROP TYPE IF EXISTS visitor_type CASCADE;

-- Enums
CREATE TYPE visitor_type AS ENUM ('GUEST', 'DELIVERY', 'STAFF', 'VENDOR');
CREATE TYPE visit_status AS ENUM ('EXPECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE help_type AS ENUM ('MAID', 'DRIVER', 'COOK', 'NANNY', 'OTHER');
CREATE TYPE help_status AS ENUM ('ACTIVE', 'BLOCKED');

-- 1. Security Guards
-- Users who are authorized to act as guards for a community
CREATE TABLE security_guard_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- 2. Visitor Passes
CREATE TABLE visitor_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    host_member_id UUID REFERENCES memberships(id) ON DELETE CASCADE, -- The resident inviting
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    type visitor_type DEFAULT 'GUEST',
    purpose TEXT,
    expected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status visit_status DEFAULT 'EXPECTED',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Daily Help (Maids, Cooks, etc.)
CREATE TABLE daily_helps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    type help_type NOT NULL,
    status help_status DEFAULT 'ACTIVE',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Daily Help Access Logs
CREATE TABLE daily_help_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    daily_help_id UUID NOT NULL REFERENCES daily_helps(id) ON DELETE CASCADE,
    direction TEXT CHECK (direction IN ('IN', 'OUT')),
    recorded_by_guard_id UUID REFERENCES security_guard_profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID REFERENCES memberships(id) ON DELETE CASCADE, -- Owner of vehicle
    plate_number TEXT NOT NULL,
    type TEXT DEFAULT 'CAR',
    sticker_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, plate_number)
);

-- 6. Vehicle Access Logs
CREATE TABLE vehicle_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    direction TEXT CHECK (direction IN ('IN', 'OUT')),
    recorded_by_guard_id UUID REFERENCES security_guard_profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE security_guard_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_helps ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_help_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_access_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function for Guard Access
CREATE OR REPLACE FUNCTION is_guard(p_community_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM security_guard_profiles
        WHERE user_id = auth.uid()
          AND community_id = p_community_id
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guard Profiles: Admins manage, Guards view own
CREATE POLICY "Admins manage guards" ON security_guard_profiles
FOR ALL USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')));
CREATE POLICY "Guards view own profile" ON security_guard_profiles
FOR SELECT USING (user_id = auth.uid());

-- Visitor Passes:
-- Members (Hosts) manage their own passes
-- Guards view/update all in community
CREATE POLICY "Hosts manage own visitors" ON visitor_passes
FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = host_member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Guards view all visitors" ON visitor_passes
FOR ALL USING (is_guard(community_id));

-- Daily Helps:
-- Admins/Guards manage
-- Members view (read-only)
CREATE POLICY "Admins and Guards manage help" ON daily_helps
FOR ALL USING (
    is_guard(community_id) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);
CREATE POLICY "Members view help" ON daily_helps
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)
);

-- Access Logs: Guards create, Admins View
CREATE POLICY "Guards create logs" ON daily_help_access_logs
FOR INSERT WITH CHECK (is_guard(community_id));
CREATE POLICY "Admins view logs" ON daily_help_access_logs
FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

-- Vehicle Access Logs: Similar to daily help logs
CREATE POLICY "Guards create vehicle logs" ON vehicle_access_logs
FOR INSERT WITH CHECK (is_guard(community_id));
