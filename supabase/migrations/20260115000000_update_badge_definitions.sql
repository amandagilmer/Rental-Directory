-- Update badge definitions to match the Patriot Hauls plan.md specification
BEGIN;

-- First, delete existing definitions to start fresh with clean metadata
DELETE FROM public.badge_definitions;

-- Insert the updated definitions
INSERT INTO public.badge_definitions 
(badge_key, name, description, icon, color, earning_criteria, is_auto_calculated, requires_verification, display_order) 
VALUES
(
  'founding_member', 
  'FOUNDING MEMBER', 
  'This operator was among the first businesses to join the Patriot Hauls network. They believed in the mission from day one.', 
  'star', 
  'gold', 
  'Joined during the founding period (2025). Manually assigned by high command.', 
  false, 
  false, 
  1
),
(
  'verified_operator', 
  'VERIFIED OPERATOR', 
  'This business has been verified as a legitimate, real operation. We''ve confirmed their identity and business ownership.', 
  'shield-check', 
  'blue', 
  'Completed identity verification (driver''s license + business verification).', 
  false, 
  true, 
  2
),
(
  'veteran_owned', 
  'VETERAN OWNED', 
  'This business is owned by a U.S. military veteran. Thank you for your service.', 
  'medal', 
  'blue', 
  'Submitted proof of veteran status (DD-214 or VA documentation).', 
  false, 
  true, 
  3
),
(
  'insured', 
  'INSURED & BONDED', 
  'This operator maintains proper business insurance and bonding. Your rental is protected.', 
  'shield', 
  'purple', 
  'Submitted proof of current insurance coverage.', 
  false, 
  true, 
  4
),
(
  'top_rated', 
  'TOP RATED', 
  'This operator consistently delivers exceptional service, earning top reviews from verified renters.', 
  'award', 
  'gold', 
  'Maintains a 4.5+ star average with at least 10 verified reviews.', 
  true, 
  false, 
  5
),
(
  'elite_operator', 
  'ELITE OPERATOR', 
  'The best of the best. This operator has achieved Top Rated status AND has a track record of numerous successful deployments.', 
  'flame', 
  'red', 
  'Maintains 4.5+ stars AND has completed 50+ verified rentals through the network.', 
  true, 
  false, 
  6
);

COMMIT;
