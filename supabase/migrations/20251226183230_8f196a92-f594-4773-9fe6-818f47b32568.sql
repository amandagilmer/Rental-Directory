-- Create table for service/unit photos
CREATE TABLE public.service_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.business_services(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view photos of published listing services"
ON public.service_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_photos.service_id
    AND bl.is_published = true
  )
);

CREATE POLICY "Users can view own service photos"
ON public.service_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_photos.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert photos for own services"
ON public.service_photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_photos.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own service photos"
ON public.service_photos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_photos.service_id
    AND bl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own service photos"
ON public.service_photos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM business_services bs
    JOIN business_listings bl ON bl.id = bs.listing_id
    WHERE bs.id = service_photos.service_id
    AND bl.user_id = auth.uid()
  )
);