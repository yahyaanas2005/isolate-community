-- Feature 38: Admin & Operations (Emergency, Notices, Docs, Store, Checklists)
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. EMERGENCY RESPONSE PLAN 🚑
-- ==========================================

DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS emergency_committees CASCADE;
DROP TABLE IF EXISTS emergency_committee_members CASCADE;

-- Public emergency contacts (Hospitals, Police, etc.)
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "City General Hospital"
    type TEXT DEFAULT 'OTHER' CHECK (type IN ('HOSPITAL', 'POLICE', 'FIRE', 'AMBULANCE', 'SECURITY', 'OTHER')),
    phone TEXT NOT NULL,
    address TEXT,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internal Emergency Response Teams (ERT)
CREATE TABLE emergency_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Disaster Response Team"
    description TEXT,
    leader_id UUID REFERENCES memberships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_committee_members (
    committee_id UUID NOT NULL REFERENCES emergency_committees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER',
    PRIMARY KEY (committee_id, user_id)
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view emergency contacts" ON emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Admins manage emergency" ON emergency_contacts FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "View emergency committees" ON emergency_committees FOR SELECT USING (true);
CREATE POLICY "Admins manage committees" ON emergency_committees FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);


-- ==========================================
-- 2. DIGITAL NOTICE BOARD & SALAAT 🕌
-- ==========================================

DROP TABLE IF EXISTS notices CASCADE;

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    target_audience TEXT DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'OWNERS', 'TENANTS', 'STAFF')),
    is_archived BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Special Field for Salaat Timings (Optional)
    -- Format: { "Fajr": "05:00", "Dhuhr": "13:30", "Asr": "17:00", "Maghrib": "19:00", "Isha": "21:00", "Jummah": "13:15" }
    salaat_times JSONB, 
    
    created_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active notices" ON notices FOR SELECT USING (
    is_archived = false AND (expires_at IS NULL OR expires_at > NOW()) AND
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)
);

CREATE POLICY "Admins manage notices" ON notices FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin', 'Staff'))
);


-- ==========================================
-- 3. RESOURCE LIBRARY (DOCUMENTS) 📂
-- ==========================================

DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    folder_name TEXT DEFAULT 'General', -- e.g. "Bylaws", "Meeting Minutes", "Forms"
    storage_path TEXT NOT NULL, -- Supabase Storage path
    
    access_level TEXT DEFAULT 'MEMBERS' CHECK (access_level IN ('PUBLIC', 'MEMBERS', 'ADMIN_ONLY', 'COMMITTEE_ONLY')),
    
    uploaded_by UUID REFERENCES memberships(id),
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View allowed documents" ON documents FOR SELECT USING (
    (access_level = 'PUBLIC') OR
    (access_level = 'MEMBERS' AND EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)) OR
    (access_level = 'ADMIN_ONLY' AND EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin')))
);

CREATE POLICY "Admins manage documents" ON documents FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);


-- ==========================================
-- 4. ONLINE STORE (B2C) 🛒
-- ==========================================

DROP TABLE IF EXISTS store_products CASCADE;
DROP TABLE IF EXISTS store_orders CASCADE;
DROP TABLE IF EXISTS store_order_items CASCADE;

CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    images TEXT[], -- Array of URLs
    category TEXT, -- "Merchandise", "Tickets", "Services"
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES memberships(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED')),
    payment_reference TEXT, -- e.g. Stripe Intent ID
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE store_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES store_products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL, -- Snapshot price at time of order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active products" ON store_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage products" ON store_products FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "Users view own orders" ON store_orders FOR SELECT USING (
    buyer_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Admins view all orders" ON store_orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);
CREATE POLICY "Users place orders" ON store_orders FOR INSERT WITH CHECK (
    buyer_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Users view check own items" ON store_order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM store_orders WHERE id = order_id AND buyer_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);


-- ==========================================
-- 5. MOVE IN/OUT CHECKLISTS 📝
-- ==========================================

DROP TABLE IF EXISTS onboarding_checklists CASCADE;
DROP TABLE IF EXISTS member_checklist_status CASCADE;

CREATE TABLE onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- "Tenant Move-In", "Owner Move-Out"
    description TEXT,
    items JSONB DEFAULT '[]'::jsonb, -- Array of { "id": "1", "text": "Submit Lease", "required": true }
    type TEXT DEFAULT 'MOVE_IN' CHECK (type IN ('MOVE_IN', 'MOVE_OUT', 'GENERAL')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE member_checklist_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES onboarding_checklists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    completed_items JSONB DEFAULT '[]'::jsonb, -- Array of item IDs that are checked
    is_complete BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(checklist_id, user_id)
);

ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_checklist_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active checklists" ON onboarding_checklists FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage checklists" ON onboarding_checklists FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin'))
);

CREATE POLICY "Users view own status" ON member_checklist_status FOR SELECT USING (
    user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Users update own status" ON member_checklist_status FOR UPDATE USING (
    user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
