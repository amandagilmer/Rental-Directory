-- Create storage bucket for business photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-photos',
  'business-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create a table to store photo references
CREATE TABLE public.business_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view photos of published listings
CREATE POLICY "Anyone can view photos of published listings"
ON public.business_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_listings
    WHERE business_listings.id = business_photos.listing_id
    AND business_listings.is_published = true
  )
);

-- Policy: Users can view their own listing photos
CREATE POLICY "Users can view own listing photos"
ON public.business_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_listings
    WHERE business_listings.id = business_photos.listing_id
    AND business_listings.user_id = auth.uid()
  )
);

-- Policy: Users can insert photos for their own listings
CREATE POLICY "Users can insert photos for own listings"
ON public.business_photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_listings
    WHERE business_listings.id = business_photos.listing_id
    AND business_listings.user_id = auth.uid()
  )
);

-- Policy: Users can update their own listing photos
CREATE POLICY "Users can update own listing photos"
ON public.business_photos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_listings
    WHERE business_listings.id = business_photos.listing_id
    AND business_listings.user_id = auth.uid()
  )
);

-- Policy: Users can delete their own listing photos
CREATE POLICY "Users can delete own listing photos"
ON public.business_photos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM business_listings
    WHERE business_listings.id = business_photos.listing_id
    AND business_listings.user_id = auth.uid()
  )
);

-- Storage policies for business-photos bucket
CREATE POLICY "Anyone can view business photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-photos');

CREATE POLICY "Authenticated users can upload business photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'business-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own business photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'business-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own business photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'business-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);