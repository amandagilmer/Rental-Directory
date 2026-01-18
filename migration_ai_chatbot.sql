-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store knowledge base documents
create table if not exists support_documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on support_documents
alter table support_documents enable row level security;

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      support_documents.id,
      support_documents.content,
      1 - (support_documents.embedding <=> query_embedding) as similarity
    from support_documents
    where 1 - (support_documents.embedding <=> query_embedding) > match_threshold
    order by support_documents.embedding <=> query_embedding
    limit match_count
  );
end;
$$;

-- Policy: Admins can do everything
create policy "Admins can manage support docs"
  on support_documents
  for all
  using (
    auth.jwt() ->> 'email' = 'amanda@automateboss.com' -- Quick admin check, ideally use a role
  );

-- Policy: Everyone (or at least authenticated users) can read docs? 
-- Actually, only the Edge Function needs to read them via service role, 
-- or we can allow public read if we want search on the frontend.
-- For now, let's keep it restricted to admins, and the bot will use service_role key.
