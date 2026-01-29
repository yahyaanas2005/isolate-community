-- ============================================================================
-- UNIFIED DATABASE SCHEMA FOR ISOLATE COMMUNITY PLATFORM
-- Modules: Membership, Complaint Management, Digital Notice Board
-- Version: 1.0.0
-- Date: 2026-01-29
-- Target: Supabase (PostgreSQL)
-- ============================================================================

-- IMPORTANT: Run this script in Supabase SQL Editor
-- This extends existing tables and creates new ones

-- ============================================================================
-- PART 1: CORE FOUNDATION (Profiles, Tenants, Memberships, Roles)
-- ============================================================================

-- 1.1 EXTEND PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cnic TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected'));

-- 1.2 EXTEND TENANTS TABLE
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Karachi';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 1.3 MEMBERSHIP TYPES (Configurable per community)
CREATE TABLE IF NOT EXISTS membership_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 1.4 EXTEND MEMBERSHIPS TABLE
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS membership_type_id UUID REFERENCES membership_types(id);
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS exit_reason TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS notes TEXT;

-- 1.5 ROLES TABLE (Per community)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 1.6 PERMISSIONS TABLE (Global)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

-- 1.7 ROLE_PERMISSIONS (Junction)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 1.8 MEMBERSHIP_ROLES (Junction - multi-role support)
CREATE TABLE IF NOT EXISTS membership_roles (
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (membership_id, role_id)
);

-- 1.9 MEMBERSHIP HISTORY (Audit trail)
CREATE TABLE IF NOT EXISTS membership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 MEMBER INVITATIONS
CREATE TABLE IF NOT EXISTS member_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    membership_type_id UUID REFERENCES membership_types(id),
    role_id UUID REFERENCES roles(id),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.11 BLOCKS/TOWERS (Location hierarchy)
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 1.12 UNITS
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
    floor INT,
    unit_no TEXT NOT NULL,
    unit_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, unit_no)
);

-- 1.13 USER_UNIT_LINKS (occupancy)
CREATE TABLE IF NOT EXISTS user_unit_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    occupancy_type TEXT NOT NULL CHECK (occupancy_type IN ('owner', 'tenant', 'family', 'staff')),
    is_primary BOOLEAN DEFAULT false,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, unit_id, occupancy_type)
);

-- 1.14 CUSTOM GROUPS/TAGS
CREATE TABLE IF NOT EXISTS member_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    group_type TEXT DEFAULT 'custom' CHECK (group_type IN ('custom', 'system', 'tag')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS member_group_members (
    group_id UUID NOT NULL REFERENCES member_groups(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, membership_id)
);

-- ============================================================================
-- PART 2: COMPLAINT MANAGEMENT (HELP DESK)
-- ============================================================================

-- 2.1 COMPLAINT CATEGORIES
CREATE TABLE IF NOT EXISTS complaint_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES complaint_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 SLA RULES
CREATE TABLE IF NOT EXISTS sla_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES complaint_categories(id) ON DELETE CASCADE,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
    response_time_hours INT NOT NULL DEFAULT 4,
    resolution_time_hours INT NOT NULL DEFAULT 24,
    escalation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, category_id, priority)
);

-- 2.3 ESCALATION RULES
CREATE TABLE IF NOT EXISTS escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    level INT NOT NULL,
    name TEXT NOT NULL,
    escalate_after_hours INT NOT NULL,
    notify_role_id UUID REFERENCES roles(id),
    notify_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, level)
);

-- 2.4 COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    complaint_no TEXT UNIQUE NOT NULL,
    
    reported_by UUID NOT NULL REFERENCES profiles(id),
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    
    category_id UUID REFERENCES complaint_categories(id),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
    is_emergency BOOLEAN DEFAULT false,
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_block_id UUID REFERENCES blocks(id),
    location_unit_id UUID REFERENCES units(id),
    location_details TEXT,
    
    status TEXT DEFAULT 'new' CHECK (status IN (
        'new', 'acknowledged', 'assigned', 'in_progress', 
        'on_hold', 'resolved', 'closed', 'reopened', 'escalated'
    )),
    assigned_to UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES profiles(id),
    
    sla_response_deadline TIMESTAMPTZ,
    sla_resolution_deadline TIMESTAMPTZ,
    sla_response_met BOOLEAN,
    sla_resolution_met BOOLEAN,
    escalation_level INT DEFAULT 0,
    
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    resolution_cost DECIMAL(12,2),
    
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES profiles(id),
    closure_confirmed_by_reporter BOOLEAN,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 COMPLAINT ATTACHMENTS
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    storage_key TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    attachment_category TEXT DEFAULT 'initial' CHECK (attachment_category IN ('initial', 'evidence', 'resolution', 'before', 'after')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 COMPLAINT LOGS (Timeline)
CREATE TABLE IF NOT EXISTS complaint_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    actor_id UUID REFERENCES profiles(id),
    is_internal BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 COMPLAINT COMMENTS
CREATE TABLE IF NOT EXISTS complaint_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES complaint_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 COMPLAINT FEEDBACK
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 STAFF/VENDOR ASSIGNMENTS
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    assignee_id UUID NOT NULL REFERENCES profiles(id),
    assignee_type TEXT DEFAULT 'staff' CHECK (assignee_type IN ('staff', 'vendor', 'contractor')),
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'rejected')),
    work_notes TEXT,
    completed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- PART 3: DIGITAL NOTICE BOARD (ANNOUNCEMENTS)
-- ============================================================================

-- 3.1 ANNOUNCEMENT CATEGORIES
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 3.2 ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('general', 'targeted', 'restricted', 'emergency')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent', 'emergency')),
    category_id UUID REFERENCES announcement_categories(id),
    
    title TEXT NOT NULL,
    body_format TEXT DEFAULT 'html' CHECK (body_format IN ('html', 'markdown', 'plain')),
    body TEXT NOT NULL,
    excerpt TEXT,
    
    ack_required BOOLEAN DEFAULT false,
    comments_enabled BOOLEAN DEFAULT true,
    pinned BOOLEAN DEFAULT false,
    highlight_banner BOOLEAN DEFAULT false,
    fullscreen_takeover BOOLEAN DEFAULT false,
    
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'scheduled', 
        'published', 'expired', 'archived', 'deleted'
    )),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    auto_archive BOOLEAN DEFAULT true,
    
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule JSONB,
    
    created_by UUID NOT NULL REFERENCES profiles(id),
    published_by UUID REFERENCES profiles(id),
    published_at TIMESTAMPTZ,
    
    recipient_count_snapshot INT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.3 ANNOUNCEMENT VARIANTS (Multi-language)
CREATE TABLE IF NOT EXISTS announcement_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    title TEXT NOT NULL,
    body_format TEXT DEFAULT 'html',
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(announcement_id, language)
);

-- 3.4 ANNOUNCEMENT CTAs (Call-to-Action Buttons)
CREATE TABLE IF NOT EXISTS announcement_ctas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('external_url', 'internal_route', 'call', 'email', 'pay_now', 'register')),
    target TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 ANNOUNCEMENT ATTACHMENTS
CREATE TABLE IF NOT EXISTS announcement_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_key TEXT NOT NULL,
    can_preview BOOLEAN DEFAULT true,
    can_download BOOLEAN DEFAULT true,
    watermark_on_download BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 TARGET RULES
CREATE TABLE IF NOT EXISTS announcement_target_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    rules JSONB NOT NULL,
    mode TEXT DEFAULT 'snapshot' CHECK (mode IN ('snapshot', 'dynamic')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 RECIPIENT SNAPSHOT
CREATE TABLE IF NOT EXISTS announcement_recipients (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delivery_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (announcement_id, user_id)
);

-- 3.8 SEEN TRACKING
CREATE TABLE IF NOT EXISTS announcement_seen (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_type TEXT,
    PRIMARY KEY (announcement_id, user_id)
);

-- 3.9 ACKNOWLEDGEMENT TRACKING
CREATE TABLE IF NOT EXISTS announcement_ack (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ack_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comment TEXT,
    source TEXT,
    PRIMARY KEY (announcement_id, user_id)
);

-- 3.10 ANNOUNCEMENT COMMENTS
CREATE TABLE IF NOT EXISTS announcement_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    kind TEXT DEFAULT 'comment' CHECK (kind IN ('comment', 'question')),
    body TEXT NOT NULL,
    status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'pending', 'hidden', 'deleted')),
    parent_id UUID REFERENCES announcement_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 ANNOUNCEMENT LIKES
CREATE TABLE IF NOT EXISTS announcement_likes (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (announcement_id, user_id)
);

-- ============================================================================
-- PART 4: APPROVAL WORKFLOWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    module TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    role_id UUID REFERENCES roles(id),
    required_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_id, step_order)
);

CREATE TABLE IF NOT EXISTS announcement_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES approval_steps(id),
    decided_by UUID REFERENCES profiles(id),
    decision TEXT CHECK (decision IN ('approved', 'rejected', 'pending')),
    comment TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: NOTIFICATIONS & JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    kind TEXT NOT NULL,
    channels JSONB NOT NULL DEFAULT '{"in_app": true, "push": true}',
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed')),
    scheduled_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES notification_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    provider_msg_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- ============================================================================
-- PART 6: AUDIT LOGS & EXPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES profiles(id),
    kind TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'xlsx', 'csv')),
    filters JSONB DEFAULT '{}',
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
    file_storage_key TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_memberships_tenant_status ON memberships(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_status ON complaints(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned ON complaints(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_by ON complaints(reported_by);
CREATE INDEX IF NOT EXISTS idx_complaints_sla ON complaints(sla_resolution_deadline, status);
CREATE INDEX IF NOT EXISTS idx_announcements_tenant_status ON announcements(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_announcements_schedule ON announcements(tenant_id, status, starts_at);
CREATE INDEX IF NOT EXISTS idx_announcement_seen_user ON announcement_seen(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_ack_user ON announcement_ack(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- SEED DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (code, module, name, description) VALUES
    -- Membership
    ('members.view', 'membership', 'View Members', 'Can view member directory'),
    ('members.create', 'membership', 'Create Members', 'Can add new members'),
    ('members.edit', 'membership', 'Edit Members', 'Can edit member details'),
    ('members.delete', 'membership', 'Delete Members', 'Can remove members'),
    ('members.approve', 'membership', 'Approve Members', 'Can approve membership requests'),
    ('members.invite', 'membership', 'Invite Members', 'Can invite new members'),
    ('members.export', 'membership', 'Export Members', 'Can export member data'),
    
    -- Complaints
    ('complaints.view', 'complaints', 'View Complaints', 'Can view complaints'),
    ('complaints.create', 'complaints', 'Create Complaints', 'Can raise complaints'),
    ('complaints.assign', 'complaints', 'Assign Complaints', 'Can assign complaints to staff'),
    ('complaints.resolve', 'complaints', 'Resolve Complaints', 'Can mark complaints as resolved'),
    ('complaints.configure', 'complaints', 'Configure Help Desk', 'Can configure categories, SLA, escalation'),
    ('complaints.reports', 'complaints', 'View Reports', 'Can view complaint analytics'),
    
    -- Announcements
    ('notices.view', 'notices', 'View Notices', 'Can view announcements'),
    ('notices.create', 'notices', 'Create Notices', 'Can create announcements'),
    ('notices.publish', 'notices', 'Publish Notices', 'Can publish announcements'),
    ('notices.approve', 'notices', 'Approve Notices', 'Can approve announcements'),
    ('notices.analytics', 'notices', 'View Analytics', 'Can view announcement analytics'),
    ('notices.configure', 'notices', 'Configure Notices', 'Can configure categories and settings'),
    
    -- Admin
    ('roles.manage', 'admin', 'Manage Roles', 'Can manage roles and permissions'),
    ('settings.manage', 'admin', 'Manage Settings', 'Can manage community settings'),
    ('audit.view', 'admin', 'View Audit Logs', 'Can view audit logs')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- RLS POLICIES (Basic - Enable RLS on new tables)
-- ============================================================================

ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unit_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_target_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_seen ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_ack ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Basic tenant isolation policies (users can see data in their communities)
-- These should be expanded based on specific role requirements

CREATE POLICY "Users can view their community membership types" ON membership_types
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view roles in their communities" ON roles
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
    );

CREATE POLICY "Anyone can view permissions" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Users can view complaints in their communities" ON complaints
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create complaints in their communities" ON complaints
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view announcements in their communities" ON announcements
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
        AND (status = 'published' OR created_by = auth.uid())
    );

-- ============================================================================
-- DONE! Schema migration complete.
-- ============================================================================
