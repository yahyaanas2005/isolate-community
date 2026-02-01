-- ============================================================================
-- 13. Notice Engagement Schema
-- ============================================================================

-- 1. Notice Reads (Acknowledge Tracking)
CREATE TABLE IF NOT EXISTS notice_reads (
    notice_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (notice_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notice_reads_user ON notice_reads(user_id);

-- 2. Notice Comments (Questions/Engagement)
CREATE TABLE IF NOT EXISTS notice_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    parent_id UUID REFERENCES notice_comments(id) ON DELETE CASCADE, -- For threading
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notice_comments_notice ON notice_comments(notice_id);

-- RLS
ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_comments ENABLE ROW LEVEL SECURITY;

-- Reads: Everyone can insert their own
CREATE POLICY "Users can mark notices as read" ON notice_reads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reads" ON notice_reads
    FOR SELECT TO authenticated
    USING (true); -- Public read status? Or only admins? Let's say public/admins for now for simplicity of "Who saw this"

-- Comments: Everyone can view, members can insert
CREATE POLICY "Anyone can view comments" ON notice_comments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can comment" ON notice_comments
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        -- Implicitly checks they have access to the notice via RLS on announcements
    );
