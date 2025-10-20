-- Create GMB connections table
CREATE TABLE public.gmb_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_email TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gmb_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for gmb_connections
CREATE POLICY "Users can view own GMB connections"
ON public.gmb_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GMB connections"
ON public.gmb_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GMB connections"
ON public.gmb_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GMB connections"
ON public.gmb_connections FOR DELETE
USING (auth.uid() = user_id);

-- Create import history table
CREATE TABLE public.import_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  error_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for import_history
CREATE POLICY "Users can view own import history"
ON public.import_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own import history"
ON public.import_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on gmb_connections
CREATE TRIGGER update_gmb_connections_updated_at
BEFORE UPDATE ON public.gmb_connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();