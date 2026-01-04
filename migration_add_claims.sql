-- Create business_claims table
create table if not exists business_claims (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references business_listings(id) not null,
  user_id uuid references auth.users(id) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  proof_doc_url text,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table business_claims enable row level security;

-- Policies for business_claims
create policy "Users can insert their own claims"
  on business_claims for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own claims"
  on business_claims for select
  using (auth.uid() = user_id);

create policy "Admins can view all claims"
  on business_claims for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can update claims"
  on business_claims for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Storage bucket for claim docs
insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

-- Storage policies
-- Note: 'owner' column in storage.objects is automatically set to auth.uid() on insert by Supabase default policies usually, 
-- but we should be explicit or rely on the fact that we can check checking against auth.uid()

create policy "Users can upload claim documents"
  on storage.objects for insert
  with check (
    bucket_id = 'claim-documents' AND
    auth.uid() = owner
  );

create policy "Users can view their own claim documents"
  on storage.objects for select
  using (
    bucket_id = 'claim-documents' AND
    auth.uid() = owner
  );
  
create policy "Admins can view all claim documents"
  on storage.objects for select
  using (
    bucket_id = 'claim-documents' AND
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
