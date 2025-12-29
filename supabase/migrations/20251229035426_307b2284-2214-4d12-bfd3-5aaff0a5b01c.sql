-- Create chat_messages table for real-time messaging
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid,
    sender_type text NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own tickets
CREATE POLICY "Users can view messages for their tickets"
ON public.chat_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = chat_messages.ticket_id
        AND support_tickets.user_id = auth.uid()
    )
);

-- Users can insert messages for their own tickets
CREATE POLICY "Users can insert messages for their tickets"
ON public.chat_messages
FOR INSERT
WITH CHECK (
    sender_type = 'user' AND
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = chat_messages.ticket_id
        AND support_tickets.user_id = auth.uid()
    )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
USING (is_admin());

-- Admins can insert messages for any ticket
CREATE POLICY "Admins can insert messages for any ticket"
ON public.chat_messages
FOR INSERT
WITH CHECK (is_admin() AND sender_type = 'admin');

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add index for faster lookups
CREATE INDEX idx_chat_messages_ticket_id ON public.chat_messages(ticket_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);