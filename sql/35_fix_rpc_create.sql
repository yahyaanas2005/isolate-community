-- Fix: Create Community via RPC (Stored Procedure)
-- Bypasses schema cache issues and ensures atomic transaction
-- Run this in Supabase SQL Editor

-- 1. Ensure the column exists (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'created_by') THEN
        ALTER TABLE tenants ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Create the Transactional Function
CREATE OR REPLACE FUNCTION create_community(name_input TEXT, slug_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as database owner to bypass Table RLS complexity during insert
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Insert Tenant
  INSERT INTO tenants (name, slug, created_by)
  VALUES (name_input, slug_input, current_user_id)
  RETURNING id INTO new_tenant_id;

  -- 2. Insert Owner Membership
  INSERT INTO memberships (user_id, tenant_id, role)
  VALUES (current_user_id, new_tenant_id, 'Owner');

  -- Return success object
  RETURN json_build_object('id', new_tenant_id, 'slug', slug_input)::jsonb;
END;
$$;
