import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const data = await fetchJson(url);
    if (data.status === 'OK') {
      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng,
        place_id: data.results[0].place_id
      };
    }
    console.log(`Geocoding status for ${address}: ${data.status}`);
  } catch (e) {
    console.error(`Fetch error for ${address}:`, e);
  }
  return null;
}

async function run() {
  const { data: listings, error } = await supabase
    .from('business_listings')
    .select('id, business_name, address')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }

  console.log(`Found ${listings.length} listings to geocode.`);

  for (const listing of listings) {
    if (!listing.address) {
      console.log(`Skipping ${listing.business_name} (no address)`);
      continue;
    }

    console.log(`Geocoding ${listing.business_name}: ${listing.address}`);
    const coords = await geocodeAddress(listing.address);
    
    if (coords) {
      const { error: updateError } = await supabase
        .from('business_listings')
        .update({
          latitude: coords.lat,
          longitude: coords.lng,
          place_id: coords.place_id
        })
        .eq('id', listing.id);

      if (updateError) {
        console.error(`Error updating ${listing.business_name}:`, updateError);
      } else {
        console.log(`Successfully geocoded ${listing.business_name}`);
      }
    } else {
      console.log(`Failed to geocode ${listing.business_name}`);
    }
  }
}

run();
