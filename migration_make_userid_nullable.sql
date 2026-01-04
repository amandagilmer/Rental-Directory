
-- Make user_id nullable in business_listings to support unclaimed listings
alter table public.business_listings alter column user_id drop not null;
