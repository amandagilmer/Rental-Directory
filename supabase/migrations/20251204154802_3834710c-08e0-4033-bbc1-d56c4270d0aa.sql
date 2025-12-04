-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT,
  date_needed TIMESTAMPTZ,
  location TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (no auth required for visitors)
CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Business owners can view leads for their listings
CREATE POLICY "Business owners can view their leads"
ON public.leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE business_listings.user_id = auth.uid()
    AND (business_listings.id::text = leads.business_id OR lower(replace(business_listings.business_name, ' ', '-')) = leads.business_id)
  )
);

-- Business owners can update leads for their listings
CREATE POLICY "Business owners can update their leads"
ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE business_listings.user_id = auth.uid()
    AND (business_listings.id::text = leads.business_id OR lower(replace(business_listings.business_name, ' ', '-')) = leads.business_id)
  )
);

-- Business owners can delete leads for their listings
CREATE POLICY "Business owners can delete their leads"
ON public.leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings
    WHERE business_listings.user_id = auth.uid()
    AND (business_listings.id::text = leads.business_id OR lower(replace(business_listings.business_name, ' ', '-')) = leads.business_id)
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;