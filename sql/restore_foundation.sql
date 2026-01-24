-- Step 0: Restore Foundation (Run this FIRST)
-- This re-creates missing tables and applies the recursion fix.

BEGIN;

-- 1. Create Tables if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Physical', 'Professional', 'Virtual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Staff', 'Member')),
    dynamic_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- 2. Seed Tenants (Safe to run multiple times)
INSERT INTO tenants (id, name, slug, type) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Sunnyvale Heights', 'sunnyvale-heights', 'Physical'),
    ('22222222-2222-2222-2222-222222222222', 'Cardiology Association', 'cardio-assoc', 'Professional'),
    ('33333333-3333-3333-3333-333333333333', 'Global Gamers', 'global-gamers', 'Virtual')
ON CONFLICT (slug) DO NOTHING;

-- 3. Fix Recursion (The Critical Fix)
-- Drop old policies to be safe
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can view community members" ON memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Public Access" ON memberships;
DROP POLICY IF EXISTS "Dev Mode: Full Access" ON memberships;

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Add simple policy
CREATE POLICY "Dev Mode: Full Access" ON memberships
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';

COMMIT;
