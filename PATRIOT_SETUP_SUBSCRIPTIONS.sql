-- ==========================================
-- PATRIOT HAULS: LIVE SUBSCRIPTION SETUP
-- ==========================================

-- 1. Create Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,          -- 'Free', 'Pro', 'Premium', 'Enterprise'
    price_monthly NUMERIC,
    price_annual NUMERIC,
    features JSONB,              -- Store list of features
    stripe_price_id TEXT,        -- Future-proofing for Stripe
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed default plans with placeholders
INSERT INTO public.subscription_plans (name, price_monthly, features, stripe_price_id)
VALUES 
    ('Free', 0, '["Basic Listing", "5 Photos", "10 Leads/mo"]', ''),
    ('Pro', 49, '["Verified Badge", "Unlimited Photos", "50 Leads/mo", "Priority Placement"]', 'price_pro_placeholder'),
    ('Premium', 99, '["Everything in Pro", "Featured Listing", "Unlimited Leads", "Phone Support"]', 'price_premium_placeholder'),
    ('Enterprise', 249, '["Custom Integrations", "API Access", "Dedicated Manager"]', 'price_enterprise_placeholder')
ON CONFLICT (name) DO UPDATE 
SET stripe_price_id = EXCLUDED.stripe_price_id,
    price_monthly = EXCLUDED.price_monthly,
    features = EXCLUDED.features;

-- 3. Update Profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id);

-- 4. Fix RLS: Admin "God Mode" View
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Ensure admins can see subscription plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

-- 5. Link existing users to 'Free' plan by default
UPDATE public.profiles p
SET plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'Free')
WHERE plan_id IS NULL;
