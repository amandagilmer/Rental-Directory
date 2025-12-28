-- Create badge definitions table (stores all possible badge types)
CREATE TABLE public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'shield',
  color text NOT NULL DEFAULT 'primary',
  earning_criteria text NOT NULL,
  is_auto_calculated boolean DEFAULT false,
  requires_verification boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create operator badges table (badges earned by operators)
CREATE TABLE public.operator_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  badge_key text NOT NULL REFERENCES public.badge_definitions(badge_key) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  verified_by uuid REFERENCES auth.users(id),
  verification_notes text,
  is_active boolean DEFAULT true,
  UNIQUE(listing_id, badge_key)
);

-- Create badge verifications table (for document uploads)
CREATE TABLE public.badge_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  document_path text NOT NULL,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  rejection_reason text
);

-- Enable RLS on all tables
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_verifications ENABLE ROW LEVEL SECURITY;

-- Badge definitions: Anyone can view
CREATE POLICY "Anyone can view badge definitions"
ON public.badge_definitions FOR SELECT
USING (true);

-- Badge definitions: Only admins can manage
CREATE POLICY "Admins can manage badge definitions"
ON public.badge_definitions FOR ALL
USING (public.is_admin());

-- Operator badges: Anyone can view active badges of published listings
CREATE POLICY "Anyone can view badges of published listings"
ON public.operator_badges FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE id = operator_badges.listing_id AND is_published = true
  )
);

-- Operator badges: Users can view their own listing badges
CREATE POLICY "Users can view own listing badges"
ON public.operator_badges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE id = operator_badges.listing_id AND user_id = auth.uid()
  )
);

-- Operator badges: Admins can manage all badges
CREATE POLICY "Admins can manage all badges"
ON public.operator_badges FOR ALL
USING (public.is_admin());

-- Badge verifications: Users can submit for their own listings
CREATE POLICY "Users can submit verifications for own listings"
ON public.badge_verifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE id = badge_verifications.listing_id AND user_id = auth.uid()
  )
);

-- Badge verifications: Users can view their own submissions
CREATE POLICY "Users can view own verification submissions"
ON public.badge_verifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE id = badge_verifications.listing_id AND user_id = auth.uid()
  )
);

-- Badge verifications: Admins can manage all
CREATE POLICY "Admins can manage all verifications"
ON public.badge_verifications FOR ALL
USING (public.is_admin());

-- Insert default badge definitions
INSERT INTO public.badge_definitions (badge_key, name, description, icon, color, earning_criteria, is_auto_calculated, requires_verification, display_order) VALUES
('verified_operator', 'Verified Operator', 'Identity and business verified by Patriot Hauls', 'shield-check', 'green', 'Submit valid ID and business license for admin verification', false, true, 1),
('veteran_owned', 'Veteran Owned', 'Business owned by a U.S. military veteran', 'medal', 'blue', 'Submit DD-214 or veteran ID for verification', false, true, 2),
('top_rated', 'Top Rated', 'Maintains 4.5+ star rating with 10+ reviews', 'star', 'yellow', 'Automatically earned with 4.5+ average rating and 10+ reviews', true, false, 3),
('quick_responder', 'Quick Responder', 'Responds to inquiries within 2 hours on average', 'zap', 'orange', 'Automatically tracked based on lead response times', true, false, 4),
('insured', 'Fully Insured', 'Verified commercial insurance on file', 'shield', 'purple', 'Upload current certificate of insurance', false, true, 5),
('fleet_pro', 'Fleet Pro', 'Operates 5+ rental units', 'truck', 'primary', 'Automatically earned when 5+ units are listed', true, false, 6),
('founding_member', 'Founding Member', 'Early adopter of Patriot Hauls Directory', 'flag', 'red', 'Joined during launch period (manually assigned)', false, false, 7),
('super_host', 'Super Host', 'Completed 50+ successful rentals', 'award', 'gold', 'Track record of 50+ completed rentals with positive feedback', false, false, 8);