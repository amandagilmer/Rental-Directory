-- This query identifies businesses that need geocoding
SELECT id, business_name, address FROM business_listings WHERE latitude IS NULL OR longitude IS NULL;
