-- 1. Reload the Schema Cache (Critical for Supabase/PostgREST)
NOTIFY pgrst, 'reload config';

-- 2. Drop and Recreate Memberships to be absolutely sure
-- (Since you are in dev mode and have no real data yet)
DROP TABLE IF EXISTS memberships;

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Staff', 'Member')),
    dynamic_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- 3. Re-Enable Public Access for Demo
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Memberships Access" ON memberships;
CREATE POLICY "Public Memberships Access" ON memberships
    FOR ALL USING (true) WITH CHECK (true);
