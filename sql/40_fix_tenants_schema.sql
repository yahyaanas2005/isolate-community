-- Fix: Remove created_by column from tenants table if it exists
-- This column is causing schema cache errors

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE tenants DROP COLUMN created_by;
    END IF;
END $$;
