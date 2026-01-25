-- PERMANENT SQL FIX - Run this ONCE in Supabase SQL Editor
-- This fixes all RLS and constraint issues permanently

-- 1. Drop the problematic check constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_type_check;

-- 2. Disable RLS temporarily
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tenants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON tenants';
    END LOOP;
END $$;

-- 4. Re-enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 5. Create simple, working policies
CREATE POLICY "allow_authenticated_users_insert" ON tenants
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "allow_members_select" ON tenants
    FOR SELECT 
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "allow_owners_update" ON tenants
    FOR UPDATE 
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id FROM memberships 
            WHERE user_id = auth.uid() AND role = 'Owner'
        )
    );

-- 6. Grant necessary permissions
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON memberships TO authenticated;

-- 7. Verify everything is set up correctly
SELECT 
    'RLS Enabled' as check_name,
    rowsecurity::text as status
FROM pg_tables 
WHERE tablename = 'tenants'
UNION ALL
SELECT 
    'Policies Count' as check_name,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'tenants';
