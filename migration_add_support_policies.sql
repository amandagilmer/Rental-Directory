-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (if not already exists)
-- Assuming 'admin' role check logic. Since we saw user_roles table referencing app_role enum likely.
-- Let's construct policies directly using the table for now to be safe.

-- Support Tickets Policies

-- 1. Allow authenticated users to create tickets
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow admins to view all tickets
-- Adjust this based on your exact admin role implementation.
-- Assuming joining with user_roles table is the standard way here.
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (ur.role = 'admin' OR ur.role = 'super_admin') -- Adjust role names as needed, 'admin' is standard
  )
);

-- 4. Allow admins to update tickets
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (ur.role = 'admin' OR ur.role = 'super_admin')
  )
);


-- Chat Messages Policies

-- 1. Allow authenticated users to add messages to tickets they own
DROP POLICY IF EXISTS "Users can add messages" ON public.chat_messages;
CREATE POLICY "Users can add messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
    -- User must own the ticket
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_id
        AND st.user_id = auth.uid()
    )
    OR
    -- OR user is admin (admins also insert messages)
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND (ur.role = 'admin' OR ur.role = 'super_admin')
    )
);

-- 2. Allow users to view messages for their tickets
DROP POLICY IF EXISTS "Users can view messages" ON public.chat_messages;
CREATE POLICY "Users can view messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
    -- User owns the ticket
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_id
        AND st.user_id = auth.uid()
    )
    OR
    -- OR user is admin
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND (ur.role = 'admin' OR ur.role = 'super_admin')
    )
);
