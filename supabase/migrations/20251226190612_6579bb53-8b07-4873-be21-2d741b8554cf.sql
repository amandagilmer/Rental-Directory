-- Add service_id column to interactions table for per-unit analytics
ALTER TABLE public.interactions 
ADD COLUMN service_id uuid REFERENCES public.business_services(id) ON DELETE SET NULL;

-- Create index for efficient per-unit queries
CREATE INDEX idx_interactions_service_id ON public.interactions(service_id);

-- Create composite index for business + unit analytics
CREATE INDEX idx_interactions_host_service ON public.interactions(host_id, service_id);