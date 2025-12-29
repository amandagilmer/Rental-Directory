-- Create review settings table for business-specific automation preferences
CREATE TABLE public.review_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL UNIQUE REFERENCES public.business_listings(id) ON DELETE CASCADE,
  auto_send_enabled boolean DEFAULT true,
  auto_send_delay_hours integer DEFAULT 48,
  send_on_completion boolean DEFAULT false,
  reminder_enabled boolean DEFAULT false,
  reminder_delay_days integer DEFAULT 7,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own review settings"
ON public.review_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = review_settings.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can insert own review settings"
ON public.review_settings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = review_settings.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can update own review settings"
ON public.review_settings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = review_settings.listing_id
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Users can delete own review settings"
ON public.review_settings FOR DELETE
USING (EXISTS (
  SELECT 1 FROM business_listings
  WHERE business_listings.id = review_settings.listing_id
  AND business_listings.user_id = auth.uid()
));

-- Create index for fast lookups
CREATE INDEX idx_review_settings_listing_id ON public.review_settings(listing_id);