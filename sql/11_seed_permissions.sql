-- ============================================================================
-- SEED: Permissions & Default Roles
-- Description: Populates the permission matrix and ensures standard roles exist.
-- ============================================================================

-- 1. Seed Permissions
INSERT INTO permissions (code, module, name, description) VALUES
-- Membership
('members.view', 'membership', 'View Members', 'Can view member directory'),
('members.invite', 'membership', 'Invite Members', 'Can invite new members'),
('members.approve', 'membership', 'Approve Members', 'Can approve pending memberships'),
('members.export', 'membership', 'Export Members', 'Can export member list'),

-- Complaints (Help Desk)
('complaints.view', 'helpdesk', 'View Complaints', 'Can view all complaints'),
('complaints.create', 'helpdesk', 'Create Complaint', 'Can raise a complaint'),
('complaints.manage', 'helpdesk', 'Manage Complaints', 'Can assign/update status'),
('complaints.resolve', 'helpdesk', 'Resolve Complaints', 'Can mark as resolved'),

-- Notices
('notices.view', 'notices', 'View Notices', 'Can view announcements'),
('notices.create', 'notices', 'Create Notices', 'Can publish new announcements'),
('notices.approve', 'notices', 'Approve Notices', 'Can approve notices'),
('notices.delete', 'notices', 'Delete Notices', 'Can delete any notice'),

-- Finance
('finance.view', 'finance', 'View Finance', 'Can view invoices and reports'),
('finance.manage', 'finance', 'Manage Finance', 'Can create invoices and record payments'),

-- Security
('security.view', 'security', 'View Security Logs', 'Can view gate logs'),
('security.manage', 'security', 'Manage Security', 'Can manage gates and guards'),

-- Settings
('settings.manage', 'settings', 'Manage Settings', 'Can access system settings')

ON CONFLICT (code) DO NOTHING;

-- 2. Seed Default Roles (if tenants exist, this is tricky b/c roles are per-tenant)
-- We cannot easily seed roles for ALL tenants here without dynamic SQL.
-- BUT, we can ensure the 'permissions' table is populated globaly (which we just did).
