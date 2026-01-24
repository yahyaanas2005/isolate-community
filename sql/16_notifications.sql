-- Feature 16: Notifications & Email Layer
-- Run this in Supabase SQL Editor

-- Clean up
DROP TRIGGER IF EXISTS trg_notify_member_joined ON memberships;
DROP TRIGGER IF EXISTS trg_notify_role_changed ON memberships;
DROP FUNCTION IF EXISTS notify_on_member_joined();
DROP FUNCTION IF EXISTS notify_on_role_changed();
DROP FUNCTION IF EXISTS get_unread_notification_count();
DROP FUNCTION IF EXISTS mark_notifications_read(uuid[]);
DROP FUNCTION IF EXISTS create_notification(uuid, uuid, notification_type, text, text, jsonb);

DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE notification_type AS ENUM (
    'MEMBER_JOINED',
    'ROLE_CHANGED',
    'SERVICE_REQUEST_CREATED',
    'SERVICE_REQUEST_ASSIGNED',
    'SERVICE_REQUEST_UPDATED',
    'INVOICE_ISSUED',
    'INVOICE_PAID',
    'PAYMENT_RECEIVED',
    'EVENT_CREATED',
    'EVENT_REMINDER',
    'POLL_OPENED',
    'POLL_CLOSED',
    'POST_CREATED',
    'COMMENT_ADDED',
    'MENTION',
    'SYSTEM_ANNOUNCEMENT'
);

-- ============================================
-- TABLES
-- ============================================

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences per user (optionally per community)
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    -- Granular type preferences (null = use defaults)
    type_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, community_id)
);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_community ON notifications(community_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = recipient_user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = recipient_user_id)
WITH CHECK (auth.uid() = recipient_user_id);

-- System can insert notifications (via service role or triggers)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_community_id UUID,
    p_recipient_user_id UUID,
    p_type notification_type,
    p_title TEXT,
    p_body TEXT DEFAULT NULL,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (community_id, recipient_user_id, type, title, body, data)
    VALUES (p_community_id, p_recipient_user_id, p_type, p_title, p_body, p_data)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_notification_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = ANY(p_notification_ids)
      AND recipient_user_id = auth.uid()
      AND is_read = FALSE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE recipient_user_id = auth.uid()
          AND is_read = FALSE
    );
END;
$$;

-- ============================================
-- TRIGGERS FOR AUTO-NOTIFICATIONS
-- ============================================

-- Trigger: Notify when a new member joins a community
CREATE OR REPLACE FUNCTION notify_on_member_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_community_name TEXT;
    v_member_name TEXT;
    v_admin RECORD;
BEGIN
    -- Get community name
    SELECT name INTO v_community_name FROM tenants WHERE id = NEW.tenant_id;
    
    -- Get new member name
    SELECT COALESCE(full_name, email) INTO v_member_name 
    FROM profiles WHERE id = NEW.user_id;
    
    -- Notify all admins/owners in the community
    FOR v_admin IN 
        SELECT m.user_id 
        FROM memberships m 
        WHERE m.tenant_id = NEW.tenant_id 
          AND m.role IN ('Owner', 'Admin')
          AND m.user_id != NEW.user_id
    LOOP
        PERFORM create_notification(
            NEW.tenant_id,
            v_admin.user_id,
            'MEMBER_JOINED',
            'New Member Joined',
            v_member_name || ' has joined ' || v_community_name,
            jsonb_build_object('membership_id', NEW.id, 'member_name', v_member_name)
        );
    END LOOP;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_member_joined
AFTER INSERT ON memberships
FOR EACH ROW
EXECUTE FUNCTION notify_on_member_joined();

-- Trigger: Notify when role changes
CREATE OR REPLACE FUNCTION notify_on_role_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_community_name TEXT;
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        SELECT name INTO v_community_name FROM tenants WHERE id = NEW.tenant_id;
        
        PERFORM create_notification(
            NEW.tenant_id,
            NEW.user_id,
            'ROLE_CHANGED',
            'Your Role Has Changed',
            'Your role in ' || v_community_name || ' has been changed to ' || NEW.role,
            jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_role_changed
AFTER UPDATE ON memberships
FOR EACH ROW
EXECUTE FUNCTION notify_on_role_changed();

-- ============================================
-- REALTIME SUBSCRIPTION
-- ============================================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
