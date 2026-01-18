/**
 * Enable Realtime for Support System
 * 
 * By default, Supabase Realtime is disabled for tables to save resources.
 * We need to explicitly add tables to the `supabase_realtime` publication
 * to listen for changes on the client side.
 */

-- Create publication if it doesn't exist (standard Supabase setup usually has this, but good for safety)
-- create publication supabase_realtime; 

-- Enable realtime for chat_messages
alter publication supabase_realtime add table chat_messages;

-- Enable realtime for support_tickets (so status updates reflect instantly too)
alter publication supabase_realtime add table support_tickets;
