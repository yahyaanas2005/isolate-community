-- =================================================================
-- CRITICAL FIX: Remove recursive RLS policies causing infinite loop
-- Run this to fix "infinite recursion detected in policy" error
-- =================================================================

-- First, temporarily DISABLE RLS on memberships table
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can view community memberships" ON memberships;
DROP POLICY IF EXISTS "Users can create memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can update memberships" ON memberships;
DROP POLICY IF EXISTS "Users can leave communities" ON memberships;

-- Create SIMPLE, NON-RECURSIVE policies

-- Policy 1: Users can always view their own memberships
CREATE POLICY "view_own_memberships"
  ON memberships FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Users can INSERT their own membership (for joining communities)
-- OR if they are owner creating membership for others
CREATE POLICY "create_memberships" 
  ON memberships FOR INSERT
  WITH CHECK (
    -- Either creating for yourself
    user_id = auth.uid()
  );

-- Policy 3: Service role (backend) can create any membership
-- This allows the API to create Owner membership when community is created
CREATE POLICY "service_create_memberships"
  ON memberships FOR INSERT
  WITH CHECK (
    -- Allow if request is from service role or if user is auth'd
    auth.jwt() IS NOT NULL
  );

-- Policy 4: Users can update memberships (for changing their own status)
CREATE POLICY "update_own_membership"
  ON memberships FOR UPDATE
  USING (user_id = auth.uid());

-- Policy 5: Users can delete their own membership (leave community)
CREATE POLICY "delete_own_membership"
  ON memberships FOR DELETE
  USING (user_id = auth.uid());

-- Re-enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS policies fixed - infinite recursion removed' AS status;
