-- Fix for Onboarding Error: "Could not find created_by column"
-- Run this in Supabase SQL Editor

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- While we are here, ensure RLS allows creation
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to create a tenant (they become the owner)
CREATE POLICY "Users can create tenants" ON tenants FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Allow owners to view/update their own tenants
CREATE POLICY "Owners can view own tenants" ON tenants FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Owners can update own tenants" ON tenants FOR UPDATE
USING (auth.uid() = created_by);
