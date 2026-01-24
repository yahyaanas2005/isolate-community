-- Fix for "Schema Cache" Error
-- Run this in Supabase SQL Editor

-- 1. Force PostgREST to reload its configuration and discover the new column
NOTIFY pgrst, 'reload config';

-- 2. (Optional) Re-run the column addition just in case it was missed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'created_by') THEN
        ALTER TABLE tenants ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;
