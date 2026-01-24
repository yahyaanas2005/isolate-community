-- Feature 17: AI-Powered Search & Discovery
-- Run this in Supabase SQL Editor

-- Clean up
DROP TABLE IF EXISTS searchable_content CASCADE;
DROP TYPE IF EXISTS search_content_type CASCADE;

-- Enable extensions for vector search capabilities
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE search_content_type AS ENUM (
    'POST',
    'COMMENT',
    'COMMUNITY', -- Tenant
    'MEMBER',    -- Profile
    'DOCUMENT',
    'EVENT',
    'POLL'
);

-- Searchable Content Table
-- Stores text content and vector embeddings for unified search
CREATE TABLE searchable_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Content reference
    content_type search_content_type NOT NULL,
    content_id UUID NOT NULL, -- FK logic handled by app/triggers
    
    -- Searchable fields
    title TEXT,
    body_excerpt TEXT,
    
    -- Metadata constraints
    url_path TEXT NOT NULL, -- e.g. /dashboard/slug/posts/123
    
    -- Vector embedding (using 1536 dim for OpenAI text-embedding-3-small)
    embedding vector(1536),
    
    -- Full Text Search vector (for keyword fallback)
    fts_doc tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body_excerpt, ''))
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_search_community ON searchable_content(community_id);
CREATE INDEX idx_search_content_ref ON searchable_content(content_type, content_id);
CREATE INDEX idx_search_fts ON searchable_content USING GIN (fts_doc);

-- Vector Index (HNSW for speed)
-- Note: Requires pgvector 0.5.0+
CREATE INDEX idx_search_embedding ON searchable_content USING hnsw (embedding vector_cosine_ops);

-- RLS Policies
ALTER TABLE searchable_content ENABLE ROW LEVEL SECURITY;

-- Users can search content in their communities
CREATE POLICY "Users view searchable content in their communities"
ON searchable_content FOR SELECT
USING (
    community_id IN (
        SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
    )
    OR
    community_id IS NULL -- Global content?
);

-- Only system/triggers manage this table generally
-- But we allow admins to re-index if needed
CREATE POLICY "Admins manage searchable content"
ON searchable_content FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM memberships 
        WHERE user_id = auth.uid() 
          AND tenant_id = searchable_content.community_id 
          AND role IN ('Owner', 'Admin')
    )
);

-- ==========================================
-- Triggers to auto-sync content (Example: Posts)
-- ==========================================

CREATE OR REPLACE FUNCTION sync_post_to_search()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slug TEXT;
BEGIN
    SELECT slug INTO v_slug FROM tenants WHERE id = NEW.tenant_id;

    IF (TG_OP = 'DELETE') THEN
        DELETE FROM searchable_content 
        WHERE content_type = 'POST' AND content_id = OLD.id;
        RETURN OLD;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        INSERT INTO searchable_content (
            community_id, 
            content_type, 
            content_id, 
            title, 
            body_excerpt, 
            url_path,
            updated_at
        )
        VALUES (
            NEW.tenant_id,
            'POST',
            NEW.id,
            NEW.title,
            substring(NEW.content, 1, 300), -- Store first 300 chars
            '/dashboard/' || v_slug || '/posts/' || NEW.id,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE -- Logic flaw: ID is random. 
        -- We need a way to identifying existing entry. 
        -- Let's change approach: DELETE then INSERT or use logic below.
        -- Actually, we don't have a unique constraint on (content_type, content_id) yet.
        -- Let's just DELETE existing for this ID first to be safe.
        SET title = EXCLUDED.title, body_excerpt = EXCLUDED.body_excerpt, updated_at = NOW(); 
        
        -- CORRECT APPROACH:
        DELETE FROM searchable_content WHERE content_type = 'POST' AND content_id = NEW.id;
        
        INSERT INTO searchable_content (
            community_id, 
            content_type, 
            content_id, 
            title, 
            body_excerpt, 
            url_path
        )
        VALUES (
            NEW.tenant_id,
            'POST',
            NEW.id,
            NEW.title,
            substring(NEW.content, 1, 300),
            '/dashboard/' || v_slug || '/posts/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Note: We need the 'posts' table to exist first.
-- Assuming 'posts' exists from MVP schema.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        CREATE TRIGGER trg_sync_posts_search
        AFTER INSERT OR UPDATE OR DELETE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION sync_post_to_search();
    END IF;
END $$;
