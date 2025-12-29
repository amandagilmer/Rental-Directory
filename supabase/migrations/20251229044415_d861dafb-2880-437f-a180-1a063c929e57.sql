-- Create categories table for dynamic category management
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'folder',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Admins can manage all categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (is_admin());

-- Seed with existing categories
INSERT INTO public.categories (name, slug, icon, display_order) VALUES
  ('Trailer Rental', 'trailer-rental', 'truck', 1),
  ('Equipment Rental', 'equipment-rental', 'hammer', 2),
  ('RV Rental', 'rv-rental', 'caravan', 3),
  ('Camper Rental', 'camper-rental', 'caravan', 4),
  ('Storage', 'storage', 'container', 5);

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();