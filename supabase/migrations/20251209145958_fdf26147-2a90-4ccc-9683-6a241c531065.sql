-- Remove expires_at from your_reviews (no auto-delete)
ALTER TABLE public.your_reviews DROP COLUMN IF EXISTS expires_at;

-- Add admin_hidden flag to gmb_reviews for manual admin hiding
ALTER TABLE public.gmb_reviews ADD COLUMN IF NOT EXISTS admin_hidden boolean DEFAULT false;

-- Add vendor_response and show_initials to your_reviews
ALTER TABLE public.your_reviews ADD COLUMN IF NOT EXISTS vendor_response text;
ALTER TABLE public.your_reviews ADD COLUMN IF NOT EXISTS vendor_response_at timestamp with time zone;
ALTER TABLE public.your_reviews ADD COLUMN IF NOT EXISTS show_initials boolean DEFAULT true;

-- Add review_token to leads for secure email verification
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS review_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS review_email_sent boolean DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS review_email_sent_at timestamp with time zone;

-- Create index on review_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_review_token ON public.leads(review_token);

-- Update RLS for your_reviews to allow vendor responses
DROP POLICY IF EXISTS "Business owners can delete reviews" ON public.your_reviews;

CREATE POLICY "Business owners can update reviews" 
ON public.your_reviews 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM business_listings 
  WHERE business_listings.id = your_reviews.business_id 
  AND business_listings.user_id = auth.uid()
));

CREATE POLICY "Business owners can delete reviews" 
ON public.your_reviews 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM business_listings 
  WHERE business_listings.id = your_reviews.business_id 
  AND business_listings.user_id = auth.uid()
));

-- Allow admins to update gmb_reviews (for admin_hidden flag)
CREATE POLICY "Admins can update gmb_reviews" 
ON public.gmb_reviews 
FOR UPDATE 
USING (is_admin());