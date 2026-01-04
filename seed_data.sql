
-- Seed data for business_listings (Corrected column names)

insert into public.business_listings (business_name, slug, description, website, phone, email, address, city, state, verified, rating, review_count, image_url, category)
values
(
  'Texas Rental Supply',
  'texas-rental-supply',
  'Premier trailer rental service in Austin.',
  'https://texasrentalsupply.com',
  '737-377-2884',
  'texasrentalsupply@gmail.com',
  'Austin, TX',
  'Austin',
  'TX',
  false,
  5.0,
  1,
  'https://images.booqablecdn.com/assets/fb7126cc-9b11-4aa4-aaf6-dad2917f746a/cmdrjuzxp00ny3b6sociqeytx(2).ChatGPTImageJul312025at102353AM-318b1a3ee0dcfa9e22a9a9619e950b509ac4cf20c006ecccfcaad79db537e954.png',
  'Trailers'
),
(
  'Diamond D Rentals LLC',
  'diamond-d-rentals-llc',
  'Reliable trailer rentals for all your hauling needs.',
  'https://diamonddrentals.com',
  '(979) 716-7522',
  'diamonddrentals@gmail.com',
  'Austin, TX',
  'Austin',
  'TX',
  false,
  0,
  0,
  'https://www.diamonddrentals.com/logo.webp',
  'Trailers'
),
(
  'Austin Rent Way',
  'austin-rent-way',
  'Your way to rent trailers in Austin.',
  'https://austinrentway.com',
  '(512) 326-8181',
  'service@austinrentway.com',
  'Austin, TX',
  'Austin',
  'TX',
  false,
  4.8,
  12,
  'https://www.austinrentway.com/image/site_logo/9bd22b8cfc73-logo_1.0.png',
  'Trailers'
),
(
  'Signature Trailer Rentals LLC.',
  'signature-trailer-rentals-llc',
  'High quality trailer rentals in Nashville.',
  'https://signaturetrailerrentals.com',
  '(615) 305-6499',
  'landon@signaturetrailerrentals.com',
  'Nashville, TN',
  'Nashville',
  'TN',
  false,
  5.0,
  3,
  'https://images.squarespace-cdn.com/content/v1/65e11f3c39b8966c3822dc8e/21d92546-bfd7-45cc-a7ae-06c7dd6f5e0c/+black+letters.png?format=1500w',
  'Trailers'
),
(
  'Turnkey Trailer Rentals',
  'turnkey-trailer-rentals',
  'Turnkey solutions for your trailer rental needs.',
  'https://turnkeytrailerrentals.com',
  '(629) 255-8260',
  'turnkeyrentals@proton.me',
  'Nashville, TN',
  'Nashville',
  'TN',
  false,
  0,
  0,
  'https://turnkeytrailerrentals.com/wp-content/uploads/2025/06/header_logo-1-scaled.png',
  'Trailers'
)
on conflict (slug) do nothing;
