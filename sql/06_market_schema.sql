-- ============================================================================
-- PART 9: MARKETPLACE & ENGAGEMENT
-- ============================================================================

-- 9.1 MARKET CATEGORIES
CREATE TABLE IF NOT EXISTS market_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.2 MARKET ITEMS (Buy/Sell)
CREATE TABLE IF NOT EXISTS market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    seller_id UUID NOT NULL REFERENCES profiles(id),
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'PKR',
    
    category_id UUID REFERENCES market_categories(id),
    
    condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    
    contacts_count INT DEFAULT 0,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'banned')),
    
    images JSONB DEFAULT '[]', -- Array of URLs
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.3 JOB LISTINGS (Hiring)
CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    employer_id UUID NOT NULL REFERENCES profiles(id), -- Resident hiring
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    salary_range TEXT, -- "10k-20k"
    
    type TEXT DEFAULT 'full_time' CHECK (type IN ('full_time', 'part_time', 'contract', 'one_time')),
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "View all items in tenant" ON market_items FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage own items" ON market_items USING (seller_id = auth.uid());

CREATE POLICY "View all jobs in tenant" ON job_listings FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage own jobs" ON job_listings USING (employer_id = auth.uid());

CREATE POLICY "View categories" ON market_categories FOR SELECT USING (true);

-- Done.
