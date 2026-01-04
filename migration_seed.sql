
INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  'Texas Rental Supply',
  'https://images.booqablecdn.com/assets/fb7126cc-9b11-4aa4-aaf6-dad2917f746a/cmdrjuzxp00ny3b6sociqeytx(2).ChatGPTImageJul312025at102353AM-318b1a3ee0dcfa9e22a9a9619e950b509ac4cf20c006ecccfcaad79db537e954.png',
  '737-377-2884',
  'texasrentalsupply@gmail.com',
  'https://texasrentalsupply.com',
  'Austin',
  'TX',
  'texas-rental-supply',
  'Trailer Rental',
  false,
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  'Diamond D Rentals LLC',
  'https://www.diamonddrentals.com/logo.webp',
  '(979) 716-7522',
  'diamonddrentals@gmail.com',
  'https://diamonddrentals.com',
  'Austin',
  'TX',
  'diamond-d-rentals-llc',
  'Trailer Rental',
  false,
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  'Austin Rent Way',
  'https://www.austinrentway.com/image/site_logo/9bd22b8cfc73-logo_1.0.png',
  '(512) 326-8181',
  'service@austinrentway.com',
  'https://austinrentway.com',
  'Austin',
  'TX',
  'austin-rent-way',
  'Trailer Rental',
  false,
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  'Signature Trailer Rentals LLC.',
  'https://images.squarespace-cdn.com/content/v1/65e11f3c39b8966c3822dc8e/21d92546-bfd7-45cc-a7ae-06c7dd6f5e0c/+black+letters.png?format=1500w',
  '(615) 305-6499',
  'landon@signaturetrailerrentals.com',
  'https://signaturetrailerrentals.com',
  'Nashville',
  'TN',
  'signature-trailer-rentals-llc',
  'Trailer Rental',
  false,
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  'Turnkey Trailer Rentals',
  'https://turnkeytrailerrentals.com/wp-content/uploads/2025/06/header_logo-1-scaled.png',
  '(629) 255-8260',
  'turnkeyrentals@proton.me',
  'https://turnkeytrailerrentals.com',
  'Nashville',
  'TN',
  'turnkey-trailer-rentals',
  'Trailer Rental',
  false,
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;
