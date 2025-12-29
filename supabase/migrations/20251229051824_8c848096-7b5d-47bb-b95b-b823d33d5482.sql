-- Create network_events table for Patriot Feed
CREATE TABLE public.network_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT 'zap',
  color TEXT DEFAULT 'primary',
  related_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.network_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view active network events (public feed)
CREATE POLICY "Anyone can view active network events"
  ON public.network_events
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Admins can manage all network events
CREATE POLICY "Admins can manage network events"
  ON public.network_events
  FOR ALL
  USING (is_admin());

-- Create index for faster queries
CREATE INDEX idx_network_events_active ON public.network_events (is_active, expires_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.network_events;

-- Insert some initial events
INSERT INTO public.network_events (event_type, title, message, icon, color) VALUES
  ('milestone', 'Network Growing Strong', '500+ operators united and counting', 'trophy', 'gold'),
  ('welcome', 'Brotherhood Active', 'Operators standing ready across America', 'shield', 'primary'),
  ('tip', 'Pro Tip', 'Complete your profile to get 3x more leads', 'lightbulb', 'accent');