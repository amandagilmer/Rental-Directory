-- Create service_locations table for multi-location support
CREATE TABLE public.service_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.business_services(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_primary BOOLEAN DEFAULT false,
  pickup_available BOOLEAN DEFAULT true,
  dropoff_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Anyone can view locations of published listing services
CREATE POLICY "Anyone can view locations of published services"
ON public.service_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_locations.service_id
    AND bl.is_published = true
  )
);

-- Users can manage locations for their own services
CREATE POLICY "Users can insert locations for own services"
ON public.service_locations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_locations.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own service locations"
ON public.service_locations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_locations.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own service locations"
ON public.service_locations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_locations.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own service locations"
ON public.service_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_locations.service_id
    AND bl.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_service_locations_updated_at
BEFORE UPDATE ON public.service_locations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();