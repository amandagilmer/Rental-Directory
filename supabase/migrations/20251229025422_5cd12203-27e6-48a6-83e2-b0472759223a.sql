-- Add booking_url field to business_listings table
ALTER TABLE public.business_listings 
ADD COLUMN IF NOT EXISTS booking_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.business_listings.booking_url IS 'External booking URL where customers can book directly';