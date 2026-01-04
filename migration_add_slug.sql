
-- Add slug column to business_listings
alter table public.business_listings add column if not exists slug text unique;
