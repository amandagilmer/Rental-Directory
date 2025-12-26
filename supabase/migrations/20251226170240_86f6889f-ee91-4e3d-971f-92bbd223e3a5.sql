-- Add claim and status fields to business_listings for host claiming
ALTER TABLE public.business_listings 
ADD COLUMN IF NOT EXISTS claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claim_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended'));

-- Create interactions table for tracking all user interactions
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  trigger_link_id uuid,
  interaction_type text NOT NULL CHECK (interaction_type IN ('profile_view', 'click_to_call', 'button_click', 'form_submit')),
  source text,
  ip_hash text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Policies for interactions
CREATE POLICY "Anyone can insert interactions" ON public.interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can view their interactions" ON public.interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.business_listings
      WHERE business_listings.id = interactions.host_id
      AND business_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all interactions" ON public.interactions
  FOR SELECT USING (public.is_admin());

-- Create trigger_links table for trackable URLs
CREATE TABLE public.trigger_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  link_type text NOT NULL CHECK (link_type IN ('profile', 'call', 'form')),
  destination text NOT NULL,
  click_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on trigger_links
ALTER TABLE public.trigger_links ENABLE ROW LEVEL SECURITY;

-- Policies for trigger_links
CREATE POLICY "Anyone can view trigger links by code" ON public.trigger_links
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their trigger links" ON public.trigger_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_listings
      WHERE business_listings.id = trigger_links.host_id
      AND business_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all trigger links" ON public.trigger_links
  FOR ALL USING (public.is_admin());

-- Add foreign key from interactions to trigger_links
ALTER TABLE public.interactions
ADD CONSTRAINT interactions_trigger_link_id_fkey
FOREIGN KEY (trigger_link_id) REFERENCES public.trigger_links(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_trigger_links_code ON public.trigger_links(code);
CREATE INDEX idx_interactions_host_id ON public.interactions(host_id);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at);
CREATE INDEX idx_business_listings_claim_token ON public.business_listings(claim_token);