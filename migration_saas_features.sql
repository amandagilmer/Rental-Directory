-- Enable UUID extension if not already (redundant but safe)
create extension if not exists "uuid-ossp";

-- 1. User Roles (Critical for Admin)
create table if not exists public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  role public.app_role not null,
  created_at timestamptz default now()
);
alter table public.user_roles enable row level security;

-- 2. Badge Definitions
create table if not exists public.badge_definitions (
    id uuid default uuid_generate_v4() primary key,
    badge_key text not null unique,
    name text not null,
    description text not null,
    icon text,
    color text,
    display_order int,
    earning_criteria text not null,
    is_auto_calculated boolean default false,
    requires_verification boolean default false,
    created_at timestamptz default now()
);
alter table public.badge_definitions enable row level security;

-- 3. Badge Verifications
create table if not exists public.badge_verifications (
    id uuid default uuid_generate_v4() primary key,
    listing_id uuid references public.business_listings(id) not null,
    badge_key text not null,
    status text default 'pending', -- approved, rejected
    document_path text not null,
    document_type text not null,
    submitted_at timestamptz default now(),
    reviewed_at timestamptz,
    reviewed_by text,
    rejection_reason text
);
alter table public.badge_verifications enable row level security;

-- 4. Operator Badges
create table if not exists public.operator_badges (
    id uuid default uuid_generate_v4() primary key,
    listing_id uuid references public.business_listings(id) not null,
    badge_key text references public.badge_definitions(badge_key) not null,
    is_active boolean default true,
    earned_at timestamptz default now(),
    verification_notes text,
    verified_by text
);
alter table public.operator_badges enable row level security;

-- 5. Blog Posts
create table if not exists public.blog_posts (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    slug text not null unique,
    content text not null,
    excerpt text,
    featured_image text,
    category text,
    tags text[],
    author_id uuid references auth.users,
    author_name text,
    is_published boolean default false,
    published_at timestamptz,
    meta_title text,
    meta_description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.blog_posts enable row level security;

-- 6. Support Tickets
create table if not exists public.support_tickets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users,
    subject text not null,
    description text not null,
    status text default 'open',
    priority text default 'medium',
    assigned_to uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.support_tickets enable row level security;

-- 7. Chat Messages
create table if not exists public.chat_messages (
    id uuid default uuid_generate_v4() primary key,
    ticket_id uuid references public.support_tickets(id) not null,
    sender_id uuid references auth.users,
    sender_type text not null, -- 'user', 'admin', 'system'
    message text not null,
    created_at timestamptz default now()
);
alter table public.chat_messages enable row level security;

-- 8. Contact Submissions
create table if not exists public.contact_submissions (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null,
    subject text not null,
    message text not null,
    is_read boolean default false,
    created_at timestamptz default now()
);
alter table public.contact_submissions enable row level security;

-- 9. FAQs
create table if not exists public.faqs (
    id uuid default uuid_generate_v4() primary key,
    question text not null,
    answer text not null,
    category text,
    display_order int,
    is_published boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.faqs enable row level security;

-- 10. GMB Connections
create table if not exists public.gmb_connections (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    account_email text not null,
    is_active boolean default true,
    last_sync_at timestamptz,
    sync_frequency text,
    connected_at timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.gmb_connections enable row level security;

-- 11. GMB Reviews
create table if not exists public.gmb_reviews (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.business_listings(id) not null,
    author text not null,
    rating int not null,
    review_text text,
    review_date timestamptz,
    admin_hidden boolean default false,
    fetched_at timestamptz default now(),
    expires_at timestamptz default now() + interval '30 days',
    created_at timestamptz default now()
);
alter table public.gmb_reviews enable row level security;

-- 12. Import History
create table if not exists public.import_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    file_name text not null,
    status text default 'pending', -- processing, completed, failed
    total_rows int default 0,
    successful_rows int default 0,
    failed_rows int default 0,
    error_log json,
    completed_at timestamptz,
    created_at timestamptz default now()
);
alter table public.import_history enable row level security;

-- 13. Interactions
create table if not exists public.interactions (
    id uuid default uuid_generate_v4() primary key,
    host_id uuid references public.business_listings(id) not null,
    interaction_type text not null, -- 'view', 'click', 'call'
    service_id uuid references public.business_services(id),
    trigger_link_id uuid, -- Simplified, creating table below
    source text,
    user_agent text,
    ip_hash text,
    created_at timestamptz default now()
);
alter table public.interactions enable row level security;

-- 14. Listing Analytics
create table if not exists public.listing_analytics (
    id uuid default uuid_generate_v4() primary key,
    listing_id uuid references public.business_listings(id) not null,
    date date,
    views int default 0,
    search_impressions int default 0,
    created_at timestamptz default now()
);
alter table public.listing_analytics enable row level security;

-- 15. Network Events
create table if not exists public.network_events (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    message text not null,
    event_type text not null,
    related_id uuid,
    icon text,
    color text,
    is_active boolean default true,
    expires_at timestamptz,
    created_at timestamptz default now()
);
alter table public.network_events enable row level security;

-- 16. Notifications
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    message text,
    type text not null,
    related_id uuid,
    is_read boolean default false,
    created_at timestamptz default now()
);
alter table public.notifications enable row level security;

-- 17. Pages (CMS)
create table if not exists public.pages (
    id uuid default uuid_generate_v4() primary key,
    slug text not null unique,
    title text not null,
    content text not null,
    meta_title text,
    meta_description text,
    updated_by uuid references auth.users,
    updated_at timestamptz default now()
);
alter table public.pages enable row level security;

-- 18. Review Settings
create table if not exists public.review_settings (
    id uuid default uuid_generate_v4() primary key,
    listing_id uuid references public.business_listings(id) not null unique,
    auto_send_enabled boolean default false,
    auto_send_delay_hours int,
    send_on_completion boolean default false,
    reminder_enabled boolean default false,
    reminder_delay_days int,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.review_settings enable row level security;

-- 19. Trigger Links
create table if not exists public.trigger_links (
    id uuid default uuid_generate_v4() primary key,
    host_id uuid references public.business_listings(id) not null,
    code text not null unique,
    destination text not null,
    link_type text not null,
    click_count int default 0,
    created_at timestamptz default now()
);
alter table public.trigger_links enable row level security;


-- RPC Function: is_admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RPC Function: has_role
create or replace function public.has_role(_role public.app_role)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role = _role
  );
end;
$$ language plpgsql security definer;

-- Add simple RLS policies for new tables (Open for now to ensure functionality)
create policy "Enable all access for authenticated users to user_roles" on public.user_roles for select using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users to notifications" on public.notifications for all using (auth.uid() = user_id);
-- (Add more specific policies as needed, but this unblocks the app)
