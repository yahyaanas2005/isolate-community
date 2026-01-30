-- ============================================================================
-- PART 9: PERFORMANCE OPTIMIZATION & FINAL SECURITY - REVISION 2
-- ============================================================================

-- Fix 1: Relocate Extensions
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Fix 2: Comprehensive Indexing (Corrected Column Names)

-- 1. Profiles & Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_user_unit_links_user ON user_unit_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_unit_links_unit ON user_unit_links(unit_id);

-- 2. Memberships
CREATE INDEX IF NOT EXISTS idx_memberships_tenant ON memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_memberships_type ON memberships(membership_type_id);

-- 3. Complaints
CREATE INDEX IF NOT EXISTS idx_complaints_tenant ON complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_reporter ON complaints(reported_by);
CREATE INDEX IF NOT EXISTS idx_complaints_assignee ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaint_logs_complaint ON complaint_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_complaint ON complaint_comments(complaint_id);

-- 4. Notices
CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON announcements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_announcements_creator ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcement_seen_ann ON announcement_seen(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_ack_ann ON announcement_ack(announcement_id);

-- 5. Approvals
CREATE INDEX IF NOT EXISTS idx_approval_steps_workflow ON approval_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_announcement_approvals_ann ON announcement_approvals(announcement_id);

-- 6. Security & Gates
CREATE INDEX IF NOT EXISTS idx_visitor_passes_tenant ON visitor_passes(tenant_id);
-- Removed invalid 'visitor_id' index (we store visitor_name text)
CREATE INDEX IF NOT EXISTS idx_visitor_passes_host ON visitor_passes(invited_by); -- Corrected from host_user_id
CREATE INDEX IF NOT EXISTS idx_visitor_passes_code ON visitor_passes(pass_code); 
CREATE INDEX IF NOT EXISTS idx_gate_logs_tenant ON gate_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gate_logs_gate ON gate_logs(gate_id);

-- 7. Billing
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);

-- 8. Market
CREATE INDEX IF NOT EXISTS idx_market_items_tenant ON market_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_market_items_seller ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category_id);
CREATE INDEX IF NOT EXISTS idx_market_items_status ON market_items(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_tenant ON job_listings(tenant_id);

-- 9. Compliance
CREATE INDEX IF NOT EXISTS idx_violations_tenant ON violations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_violations_reporter ON violations(reported_by);
CREATE INDEX IF NOT EXISTS idx_violations_offender ON violations(offender_unit_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);

-- Done.
