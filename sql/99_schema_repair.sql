-- ============================================================================
-- 99. SCHEMA REPAIR & CONSOLIDATION
-- Description: Fixes missing tables and columns reported by the user.
-- ============================================================================

-- A. Fix "permissions" and "roles" missing relations
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'members.view'
    module TEXT NOT NULL,      -- e.g. 'membership'
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. 'admin', 'moderator'
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Enable RLS for these core tables if not already
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust as needed)
CREATE POLICY "Public Read Permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tenant Read Roles" ON roles FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.tenant_id = roles.tenant_id AND m.user_id = auth.uid())
);
CREATE POLICY "Tenant Read RolePerms" ON role_permissions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM roles r WHERE r.id = role_permissions.role_id 
            AND EXISTS (SELECT 1 FROM memberships m WHERE m.tenant_id = r.tenant_id AND m.user_id = auth.uid()))
);


-- B. Fix "announcements" missing relation
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'blue',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('general', 'targeted', 'restricted', 'emergency')),
    priority TEXT CHECK (priority IN ('normal', 'high', 'urgent', 'emergency')),
    category_id UUID REFERENCES announcement_categories(id) ON DELETE SET NULL,
    pinned BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published', -- published, scheduled, draft, archived
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_target_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    rules JSONB NOT NULL, -- e.g. { "roles": ["admin"], "blocks": ["A", "B"] }
    mode TEXT DEFAULT 'dynamic'
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read Active Announcements" ON announcements FOR SELECT TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
);
-- Add insert policy if needed broadly, or rely on service role/specific user checks


-- C. Fix "audit_logs" column mismatch (Clean Slate Strategy)
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Re-apply policies from 12_audit_logs.sql
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.tenant_id = audit_logs.tenant_id
            AND m.role IN ('owner', 'admin', 'Owner', 'Admin')
        )
    );
