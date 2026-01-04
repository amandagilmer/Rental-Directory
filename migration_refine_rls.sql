-- Refine RLS policies for Admin access

-- 1. Review and Update Business Listings Policy
-- Allow admins to update any business listing (critical for claim approval)
create policy "Admins can update all listings"
  on public.business_listings
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Allow admins to delete listings 
create policy "Admins can delete all listings"
  on public.business_listings
  for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- 2. Ensure Profiles are viewable/editable by admins
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- 3. Business Services/Photos/Hours/Areas Admin Access
-- Useful for full admin management
create policy "Admins can manage business services"
  on public.business_services
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can manage business photos"
  on public.business_photos
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can manage business hours"
  on public.business_hours
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can manage service areas"
  on public.service_areas
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
