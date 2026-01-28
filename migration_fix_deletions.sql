-- 1. Infrastructure: Helper Functions

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role "UserRole")
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
$$;

-- 2. Fix Listing Deletion Blockers (business_listings cascades)

-- business_services
ALTER TABLE public.business_services 
DROP CONSTRAINT IF EXISTS business_services_listing_id_fkey,
ADD CONSTRAINT business_services_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- business_hours
ALTER TABLE public.business_hours 
DROP CONSTRAINT IF EXISTS business_hours_listing_id_fkey,
ADD CONSTRAINT business_hours_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- service_areas
ALTER TABLE public.service_areas 
DROP CONSTRAINT IF EXISTS service_areas_listing_id_fkey,
ADD CONSTRAINT service_areas_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- leads
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_business_id_fkey,
ADD CONSTRAINT leads_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- your_reviews
ALTER TABLE public.your_reviews 
DROP CONSTRAINT IF EXISTS your_reviews_business_id_fkey,
ADD CONSTRAINT your_reviews_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- business_photos
ALTER TABLE public.business_photos 
DROP CONSTRAINT IF EXISTS business_photos_listing_id_fkey,
ADD CONSTRAINT business_photos_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


-- 3. Fix User Deletion Blockers (profiles cascades)

-- business_listings -> profiles
ALTER TABLE public.business_listings 
DROP CONSTRAINT IF EXISTS business_listings_user_id_fkey,
ADD CONSTRAINT business_listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- 4. Security: Grant Admin Deletion Permissions

-- Profiles: Admins can delete all profiles
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
CREATE POLICY "Admins can delete all profiles"
ON public.profiles FOR DELETE
USING (public.is_admin());

-- Listings: Admins can delete all listings
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.business_listings;
CREATE POLICY "Admins can delete all listings"
ON public.business_listings FOR DELETE
USING (public.is_admin());

