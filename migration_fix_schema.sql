
-- Add missing columns to business_listings
alter table public.business_listings add column if not exists city text;
alter table public.business_listings add column if not exists state text;
alter table public.business_listings add column if not exists zip_code text;

-- Fix column name for image_url if needed (it is image_url in table, logo_url in json)
-- (No change needed, just mapping in seed script)
