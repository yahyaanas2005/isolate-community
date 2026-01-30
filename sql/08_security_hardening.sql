-- ============================================================================
-- PART 8: SECURITY HARDENING (Fixing MVP Policies) - REVISION 2
-- ============================================================================

-- Fix 1: Secure Functions (Role Mutable Search Path)
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- Fix 2: Tenant RLS (Restrict Write Access)
DROP POLICY IF EXISTS "allow_all_tenants" ON tenants;
DROP POLICY IF EXISTS "allow_tenants_select" ON tenants;
DROP POLICY IF EXISTS "allow_tenants_insert" ON tenants;
DROP POLICY IF EXISTS "allow_tenants_update" ON tenants;

-- Everyone can read tenants
CREATE POLICY "Public read tenants" ON tenants FOR SELECT USING (true);

-- Authenticated can create
CREATE POLICY "Authenticated create tenant" ON tenants FOR INSERT TO authenticated WITH CHECK (true);

-- Only Admin members can update
CREATE POLICY "Admins update tenant" ON tenants FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM memberships m 
        WHERE m.tenant_id = tenants.id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin', 'Owner', 'Admin', 'chairman', 'Chairman')
    )
);

-- Fix 3: Profile RLS (Restrict Write Access)
DROP POLICY IF EXISTS "Public Access" ON profiles;
DROP POLICY IF EXISTS "allow_all_profiles" ON profiles;

-- Public read
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Own update
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Fix 4: Membership RLS
DROP POLICY IF EXISTS "allow_all_memberships" ON memberships;

-- 1. Users view own
CREATE POLICY "Users view own memberships" ON memberships FOR SELECT USING (user_id = auth.uid());

-- 2. Authenticated view all (Directory)
CREATE POLICY "Authenticated view memberships" ON memberships FOR SELECT TO authenticated USING (true);

-- 3. Users manage self (Exit)
CREATE POLICY "Users manage self" ON memberships FOR UPDATE USING (user_id = auth.uid());

-- 4. Admins Manage All
-- FUNCTION: is_admin(tenant_id)
CREATE OR REPLACE FUNCTION is_admin(t_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.tenant_id = t_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'Owner', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply Admin Policies
CREATE POLICY "Admins update memberships" ON memberships FOR UPDATE USING (is_admin(tenant_id));
CREATE POLICY "Admins delete memberships" ON memberships FOR DELETE USING (is_admin(tenant_id));

-- Fix 5: Indexes (Performance)
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_market_items_seller ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_violations_reporter ON violations(reported_by);

-- Done.
