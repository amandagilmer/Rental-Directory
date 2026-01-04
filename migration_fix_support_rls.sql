-- Fix RLS policies for Support Tickets and Chat Messages

-- 1. Support Tickets Policies
-- Allow authenticated users to create tickets
create policy "Users can create their own tickets"
  on public.support_tickets
  for insert
  with check (auth.uid() = user_id);

-- Allow users to view their own tickets
create policy "Users can view their own tickets"
  on public.support_tickets
  for select
  using (auth.uid() = user_id);

-- Allow admins to view all tickets
create policy "Admins can view all tickets"
  on public.support_tickets
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Allow admins to update tickets (status, priority, assignment)
create policy "Admins can update all tickets"
  on public.support_tickets
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- 2. Chat Messages Policies
-- Allow authenticated users to create messages for their tickets
create policy "Users can add messages to their tickets"
  on public.chat_messages
  for insert
  with check (
    -- Sender must be the user
    auth.uid() = sender_id
    and
    -- Ticket must belong to the user
    exists (
      select 1 from public.support_tickets
      where id = ticket_id
      and user_id = auth.uid()
    )
  );

-- Allow users to view messages for their tickets
create policy "Users can view messages for their tickets"
  on public.chat_messages
  for select
  using (
    exists (
      select 1 from public.support_tickets
      where id = ticket_id
      and user_id = auth.uid()
    )
  );

-- Allow admins to view all chat messages
create policy "Admins can view all chat messages"
  on public.chat_messages
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Allow admins to send messages (reply)
create policy "Admins can send messages"
  on public.chat_messages
  for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
