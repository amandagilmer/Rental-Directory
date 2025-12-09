-- Create gmb_reviews table for cached Google reviews
CREATE TABLE public.gmb_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create your_reviews table for user-submitted reviews
CREATE TABLE public.your_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '90 days')
);

-- Add place_id column to business_listings for Google Places API
ALTER TABLE public.business_listings ADD COLUMN IF NOT EXISTS place_id TEXT;

-- Enable RLS on both tables
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_reviews ENABLE ROW LEVEL SECURITY;

-- GMB Reviews policies - anyone can view, only system can insert/update
CREATE POLICY "Anyone can view gmb_reviews" ON public.gmb_reviews FOR SELECT USING (true);

-- Your Reviews policies
CREATE POLICY "Anyone can view your_reviews" ON public.your_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can submit reviews" ON public.your_reviews FOR INSERT WITH CHECK (true);

-- Business owners can delete reviews on their listings
CREATE POLICY "Business owners can delete reviews" ON public.your_reviews FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.business_listings 
  WHERE business_listings.id = your_reviews.business_id 
  AND business_listings.user_id = auth.uid()
));

-- Index for efficient queries
CREATE INDEX idx_gmb_reviews_business_id ON public.gmb_reviews(business_id);
CREATE INDEX idx_gmb_reviews_expires_at ON public.gmb_reviews(expires_at);
CREATE INDEX idx_your_reviews_business_id ON public.your_reviews(business_id);
CREATE INDEX idx_your_reviews_expires_at ON public.your_reviews(expires_at);