-- Create function to notify admins when contact form is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_on_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Loop through all admin users and create notifications for each
  FOR admin_user IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      admin_user.user_id,
      'contact_message',
      'New Contact Message',
      'New message from ' || NEW.name || ' - Subject: ' || NEW.subject,
      NEW.id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger to fire after contact submission insert
CREATE TRIGGER notify_admins_on_contact_insert
AFTER INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_contact_submission();

-- Also create a trigger to notify admins on new support tickets
CREATE OR REPLACE FUNCTION public.notify_admins_on_support_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Loop through all admin users and create notifications for each
  FOR admin_user IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      admin_user.user_id,
      'support_ticket',
      'New Support Ticket',
      'Priority: ' || NEW.priority || ' - ' || NEW.subject,
      NEW.id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger to fire after support ticket insert
CREATE TRIGGER notify_admins_on_support_ticket_insert
AFTER INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_support_ticket();