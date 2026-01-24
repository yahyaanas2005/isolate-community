-- Fixed migration for slug column
-- This version handles the missing updated_at column issue

-- Step 1: Add updated_at column if missing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Add slug column if missing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 3: Generate slugs for existing tenants (only for rows that don't have slug)
UPDATE tenants 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), '''', ''))
WHERE slug IS NULL OR slug = '';

-- Step 4: Make slug NOT NULL
ALTER TABLE tenants ALTER COLUMN slug SET NOT NULL;

-- Step 5: Add unique constraint (drop first if exists to avoid errors)
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_slug_unique;
ALTER TABLE tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);

-- Step 6: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Success message
SELECT 'Slug column migration completed successfully!' as status;
