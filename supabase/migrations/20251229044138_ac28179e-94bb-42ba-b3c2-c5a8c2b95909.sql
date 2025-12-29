-- Add additional_categories column for multi-category support
ALTER TABLE public.business_listings 
ADD COLUMN additional_categories text[] DEFAULT '{}'::text[];