-- =====================================================
-- MARKETING & SEGMENTATION INFRASTRUCTURE
-- =====================================================

-- 1. Create user type enum for two-sided marketplace
CREATE TYPE public.user_type AS ENUM ('renter', 'host', 'both');

-- 2. Create customer segment enum for lead classification
CREATE TYPE public.customer_segment AS ENUM (
  'new_inquiry',        -- First-time lead
  'repeat_customer',    -- Has rented before
  'high_value',         -- Large/frequent orders
  'converted',          -- Became a paying customer
  'inactive'            -- No activity in 90+ days
);

-- 3. Add user_type to profiles for marketing segmentation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type public.user_type DEFAULT 'renter',
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS signup_source text;

-- 4. Add marketing fields to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_segment public.customer_segment DEFAULT 'new_inquiry',
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS referrer_url text,
ADD COLUMN IF NOT EXISTS last_interaction_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_inquiries integer DEFAULT 1;

-- 5. Create storage bucket for service/unit photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-photos', 
  'service-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 6. Create storage bucket for badge verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'badge-documents', 
  'badge-documents', 
  false, -- Private - only admins should access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 7. RLS policies for service-photos bucket
CREATE POLICY "Anyone can view service photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-photos');

CREATE POLICY "Authenticated users can upload service photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-photos');

CREATE POLICY "Users can update their own service photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own service photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. RLS policies for badge-documents bucket (private)
CREATE POLICY "Only admins can view badge documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'badge-documents' AND public.is_admin());

CREATE POLICY "Authenticated users can upload badge documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'badge-documents');

CREATE POLICY "Admins can delete badge documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'badge-documents' AND public.is_admin());

-- 9. Create index for marketing queries on leads
CREATE INDEX IF NOT EXISTS idx_leads_marketing_consent ON public.leads (marketing_consent) WHERE marketing_consent = true;
CREATE INDEX IF NOT EXISTS idx_leads_customer_segment ON public.leads (customer_segment);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads (utm_source) WHERE utm_source IS NOT NULL;

-- 10. Create index for user type queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles (user_type);

-- 11. Update handle_new_user function to capture signup source
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, business_name, location, user_type, signup_source)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'location',
    COALESCE((new.raw_user_meta_data->>'user_type')::public.user_type, 'renter'),
    new.raw_user_meta_data->>'signup_source'
  );
  RETURN new;
END;
$$;