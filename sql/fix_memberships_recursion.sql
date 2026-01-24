-- Fix Memberships Table Infinite Recursion
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Drop existing policies on memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can view community members" ON memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Public Access" ON memberships;

-- Step 2: Create simple, non-recursive policy
-- This allows all authenticated users to read/write for now (dev mode)
-- TODO: Replace with proper policies after core features work
CREATE POLICY "Dev Mode: Full Access" ON memberships
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify RLS is enabled
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Step 4: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

COMMIT;
