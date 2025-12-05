-- Add social links columns to business_listings
ALTER TABLE public.business_listings
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Create business_hours table
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  is_closed BOOLEAN DEFAULT false,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, day_of_week)
);

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hours of published listings"
ON public.business_hours FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_hours.listing_id
  AND business_listings.is_published = true
));

CREATE POLICY "Users can view own listing hours"
ON public.business_hours FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_hours.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can insert hours for own listings"
ON public.business_hours FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_hours.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can update own listing hours"
ON public.business_hours FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_hours.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can delete own listing hours"
ON public.business_hours FOR DELETE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_hours.listing_id
  AND business_listings.user_id = auth.uid()
));

-- Create business_services table
CREATE TABLE public.business_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_unit TEXT DEFAULT 'per day' CHECK (price_unit IN ('per hour', 'per day', 'per week', 'per event', 'contact for pricing')),
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services of published listings"
ON public.business_services FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_services.listing_id
  AND business_listings.is_published = true
));

CREATE POLICY "Users can view own listing services"
ON public.business_services FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_services.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can insert services for own listings"
ON public.business_services FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_services.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can update own listing services"
ON public.business_services FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_services.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can delete own listing services"
ON public.business_services FOR DELETE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = business_services.listing_id
  AND business_listings.user_id = auth.uid()
));

-- Create service_areas table
CREATE TABLE public.service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL CHECK (area_type IN ('zip_code', 'radius')),
  zip_codes TEXT[], -- Array of zip codes if area_type is 'zip_code'
  radius_miles INTEGER, -- Radius in miles if area_type is 'radius'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id)
);

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service areas of published listings"
ON public.service_areas FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = service_areas.listing_id
  AND business_listings.is_published = true
));

CREATE POLICY "Users can view own listing service areas"
ON public.service_areas FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = service_areas.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can insert service areas for own listings"
ON public.service_areas FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = service_areas.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can update own listing service areas"
ON public.service_areas FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = service_areas.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can delete own listing service areas"
ON public.service_areas FOR DELETE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = service_areas.listing_id
  AND business_listings.user_id = auth.uid()
));