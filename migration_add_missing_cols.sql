
-- Add missing columns for rating and verification
alter table public.business_listings add column if not exists verified boolean default false;
alter table public.business_listings add column if not exists rating numeric default 0;
alter table public.business_listings add column if not exists review_count int default 0;
