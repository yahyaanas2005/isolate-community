-- ============================================================================
-- 12. Audit Logs Schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,           -- e.g., 'role.create', 'complaint.update'
    entity_type TEXT NOT NULL,      -- e.g., 'roles', 'complaints'
    entity_id TEXT,                 -- UUID of the affected entity
    details JSONB DEFAULT '{}'::JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins/Owners can VIEW audit logs
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

-- System can insert (or any authenticated user effectively via server actions if we use Service Role, but usually we want to restrict)
-- If we log from Server Actions using the user's client, we need INSERT policy.
CREATE POLICY "Users can insert audit logs" ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.tenant_id = audit_logs.tenant_id
        )
    );
