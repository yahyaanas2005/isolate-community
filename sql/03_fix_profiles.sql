-- 1. Create Profiles Table (if it was missed)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grant Permissions to Anon/Public (Required for "Add Member" without Auth)
-- This allows the public API to read and write to these tables.
-- IN PRODUCTION: You would lock this down to authenticated users only.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public Profiles Access" ON profiles;
CREATE POLICY "Public Profiles Access" ON profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Memberships Policies
DROP POLICY IF EXISTS "Public Memberships Access" ON memberships;
CREATE POLICY "Public Memberships Access" ON memberships
    FOR ALL USING (true) WITH CHECK (true);

-- Tenants Policies
DROP POLICY IF EXISTS "Public Tenants Access" ON tenants;
CREATE POLICY "Public Tenants Access" ON tenants
    FOR SELECT USING (true);
