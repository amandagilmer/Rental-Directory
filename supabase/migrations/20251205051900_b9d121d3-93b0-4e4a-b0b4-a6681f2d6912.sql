-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Allow system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to notify business owner on new lead
CREATE OR REPLACE FUNCTION public.notify_business_owner_on_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_owner_id UUID;
  business_name_val TEXT;
BEGIN
  -- Find the business owner from business_listings
  SELECT user_id, business_name INTO business_owner_id, business_name_val
  FROM public.business_listings
  WHERE id::text = NEW.business_id 
     OR lower(replace(business_name, ' ', '-')) = NEW.business_id
  LIMIT 1;

  -- If we found an owner, create a notification
  IF business_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      business_owner_id,
      'new_lead',
      'New Quote Request',
      'You received a new quote request from ' || NEW.name || ' for ' || COALESCE(NEW.service_type, 'your services'),
      NEW.id::text
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to fire on new lead
CREATE TRIGGER on_new_lead_notify
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_business_owner_on_lead();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;