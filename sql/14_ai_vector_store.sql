-- ============================================================================
-- 14. AI Vector Store & Knowledge Base
-- description: Enables pgvector and creates documents table for RAG.
-- ============================================================================

-- 1. Enable Extension (Must be Superuser, user might need to run this in dashboard if RLS blocks extension creation)
-- We Include it here, but comment note: "Run in SQL Editor directly if permissions fail"
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Knowledge Base Documents
CREATE TABLE IF NOT EXISTS knowledge_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Raw text content
    metadata JSONB DEFAULT '{}'::JSONB, -- Source (URL, PDF name), Category
    embedding vector(1536), -- Standard OpenAI Ada-002 dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON knowledge_docs USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100); -- Adjust lists based on dataset size (rows / 1000)

-- RLS
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage docs" ON knowledge_docs
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.tenant_id = knowledge_docs.tenant_id
            AND m.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Everyone can read docs" ON knowledge_docs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.tenant_id = knowledge_docs.tenant_id
        )
    );

-- 3. Document Processing Queue (Optional, helps if we async process uploads)
CREATE TABLE IF NOT EXISTS doc_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID REFERENCES knowledge_docs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
