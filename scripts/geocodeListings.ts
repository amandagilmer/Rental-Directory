
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function geocodeAddress(address: string) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                place_id: result.place_id,
                formatted_address: result.formatted_address
            };
        }
        console.error(`Geocoding failed for address: ${address}`, data.status);
    } catch (err) {
        console.error(`Geocoding error for address: ${address}`, err);
    }
    return null;
}

async function run() {
    console.log('Fetching business listings without coordinates...');
    const { data: listings, error: fetchError } = await supabase
        .from('business_listings')
        .select('id, business_name, address')
        .or('latitude.is.null,longitude.is.null');

    if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        return;
    }

    if (!listings || listings.length === 0) {
        console.log('No listings found requiring geocoding.');
        return;
    }

    console.log(`Found ${listings.length} listings to geocode.`);

    for (const listing of listings) {
        if (!listing.address) {
            console.log(`Skipping listing ${listing.business_name} (no address).`);
            continue;
        }

        console.log(`Geocoding: ${listing.business_name} (${listing.address})...`);
        const coords = await geocodeAddress(listing.address);

        if (coords) {
            const { error: updateError } = await supabase
                .from('business_listings')
                .update({
                    latitude: coords.lat,
                    longitude: coords.lng,
                    place_id: coords.place_id,
                    // Optionally update address to formatted one if it's more complete
                    // address: coords.formatted_address 
                })
                .eq('id', listing.id);

            if (updateError) {
                console.error(`Failed to update ${listing.business_name}:`, updateError);
            } else {
                console.log(`Successfully updated ${listing.business_name} at (${coords.lat}, ${coords.lng})`);
            }
        }

        // Wait a bit to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Geocoding process complete.');
}

run();
