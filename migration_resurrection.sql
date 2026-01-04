-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.customer_segment as enum ('new_inquiry', 'repeat_customer', 'high_value', 'converted', 'inactive');
create type public.user_type as enum ('renter', 'host', 'both');

-- Create Tables

-- 1. Profiles (Core User Table)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  business_name text,
  location text,
  marketing_consent boolean default false,
  signup_source text,
  user_type public.user_type,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2. Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  icon text,
  display_order int,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.categories enable row level security;

-- 3. Business Listings
create table public.business_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  business_name text not null,
  category text not null, -- simplified from FK for now based on types
  description text,
  phone text,
  email text,
  website text,
  address text,
  latitude double precision,
  longitude double precision,
  place_id text,
  image_url text,
  status text default 'pending',
  is_published boolean default false,
  claimed boolean default false,
  claim_token text,
  booking_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  linkedin_url text,
  youtube_url text,
  owner_name text,
  additional_categories text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.business_listings enable row level security;

-- 4. Business Photos
create table public.business_photos (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.business_listings(id) not null,
  storage_path text not null,
  file_name text not null,
  file_size int,
  is_primary boolean default false,
  display_order int,
  created_at timestamptz default now()
);
alter table public.business_photos enable row level security;

-- 5. Business Services
create table public.business_services (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.business_listings(id) not null,
  service_name text not null,
  description text,
  price numeric,
  price_unit text,
  daily_rate numeric,
  weekly_rate numeric,
  monthly_rate numeric,
  three_day_rate numeric,
  is_available boolean default true,
  display_order int,
  year_make_model text,
  sub_category text,
  asset_class text,
  traction_type text,
  features text[],
  payload_capacity text,
  length_ft text,
  empty_weight text,
  hitch_connection text,
  axle_configuration text,
  ball_size text,
  electrical_plug text,
  dimensions text,
  youtube_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.business_services enable row level security;

-- 6. Business Hours
create table public.business_hours (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.business_listings(id) not null,
  day_of_week int not null,
  open_time time,
  close_time time,
  is_closed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.business_hours enable row level security;

-- 7. Service Areas
create table public.service_areas (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.business_listings(id) not null,
  area_type text not null,
  radius_miles numeric,
  zip_codes text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.service_areas enable row level security;

-- 8. Service Locations
create table public.service_locations (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.business_services(id) not null,
  location_name text not null,
  address text,
  city text,
  state text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  is_primary boolean default false,
  pickup_available boolean default true,
  dropoff_available boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.service_locations enable row level security;

-- 9. Service Photos
create table public.service_photos (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.business_services(id) not null,
  storage_path text not null,
  file_name text not null,
  file_size int,
  is_primary boolean default false,
  display_order int,
  created_at timestamptz default now()
);
alter table public.service_photos enable row level security;

-- 10. Reviews & Leads (Simplified for brevity but essential)
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.business_listings(id) not null,
  name text not null,
  email text not null,
  phone text not null,
  status text default 'new',
  message text,
  customer_segment public.customer_segment,
  date_needed timestamptz,
  service_type text,
  marketing_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.leads enable row level security;

create table public.your_reviews (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.business_listings(id) not null,
  lead_id uuid references public.leads(id),
  author_name text not null,
  author_email text,
  rating int not null,
  review_text text,
  vendor_response text,
  vendor_response_at timestamptz,
  created_at timestamptz default now()
);
alter table public.your_reviews enable row level security;

-- Storage Bucket Setup
insert into storage.buckets (id, name, public)
values ('business-photos', 'business-photos', true)
on conflict (id) do nothing;

create policy "Images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'business-photos' );

create policy "Authenticated users can upload images."
  on storage.objects for insert
  with check ( bucket_id = 'business-photos' and auth.role() = 'authenticated' );

-- Simple RLS Policies (Open for now to get started, can refine later)
create policy "Public read access" on public.business_listings for select using (true);
create policy "Public read access" on public.business_services for select using (true);
create policy "Public read access" on public.business_photos for select using (true);
create policy "Users can manage own listings" on public.business_listings
  for all using (auth.uid() = user_id);

create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, business_name)
  values (new.id, new.email, new.raw_user_meta_data->>'business_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
