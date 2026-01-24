-- Feature 17: AI Search RPC Function
-- Run this in Supabase SQL Editor

-- 1. Create the RPC function to match documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_community_id uuid DEFAULT NULL
)
returns table (
  id uuid,
  content_type text,
  content_id uuid,
  title text,
  body_excerpt text,
  url_path text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    searchable_content.id,
    searchable_content.content_type::text,
    searchable_content.content_id,
    searchable_content.title,
    searchable_content.body_excerpt,
    searchable_content.url_path,
    1 - (searchable_content.embedding <=> query_embedding) as similarity
  from searchable_content
  where 1 - (searchable_content.embedding <=> query_embedding) > match_threshold
  and (
      filter_community_id IS NULL 
      OR searchable_content.community_id = filter_community_id
  )
  order by searchable_content.embedding <=> query_embedding
  limit match_count;
end;
$$;
