-- Add latitude and longitude columns to business_listings
ALTER TABLE public.business_listings 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create index for geographic queries
CREATE INDEX IF NOT EXISTS idx_business_listings_location 
ON public.business_listings (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;