-- Fix: Drop RLS policies that depend on created_by, then drop the column

-- 1. Drop the dependent policies
DROP POLICY IF EXISTS "Users can create tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can view own tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can update own tenants" ON tenants;

-- 2. Drop the created_by column
ALTER TABLE tenants DROP COLUMN IF EXISTS created_by;

-- 3. Recreate simpler policies without created_by dependency
-- Allow authenticated users to create tenants
CREATE POLICY "Users can create tenants" ON tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view tenants they are members of
CREATE POLICY "Members can view their tenants" ON tenants
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
    );

-- Allow owners to update their tenants
CREATE POLICY "Owners can update their tenants" ON tenants
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id FROM memberships 
            WHERE user_id = auth.uid() AND role = 'Owner'
        )
    );
