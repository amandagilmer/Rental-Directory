import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { business_id, place_id, access_token, mode, query: searchQuery } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // NEW: Search Mode to bypass frontend API restrictions
        if (mode === 'search') {
            if (!searchQuery) throw new Error('Query is required for search mode');
            if (!googleApiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured in Supabase');

            console.log(`Searching for business: ${searchQuery}`);
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleApiKey}`;
            const response = await fetch(searchUrl);
            const data = await response.json();

            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`Google API error: ${data.status} - ${data.error_message || ''}`);
            }

            return new Response(
                JSON.stringify({ results: data.results || [] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!business_id || !place_id) {
            return new Response(
                JSON.stringify({ error: 'business_id and place_id are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        let googleReviews = [];

        if (access_token && place_id.startsWith('accounts/')) {
            // HIGH-STAKES: Use GMB API for full review scrape
            console.log(`Using GMB API for deep scrape: ${place_id}`);
            const gmbUrl = `https://mybusiness.googleapis.com/v4/${place_id}/reviews`;
            const gmbResponse = await fetch(gmbUrl, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            const gmbData = await gmbResponse.json();

            if (gmbData.reviews) {
                googleReviews = gmbData.reviews.map((r: any) => ({
                    author_name: r.commenter?.displayName || 'Anonymous',
                    rating: r.starRating === 'FIVE' ? 5 : r.starRating === 'FOUR' ? 4 : r.starRating === 'THREE' ? 3 : r.starRating === 'TWO' ? 2 : 1,
                    text: r.comment || '',
                    time: Math.floor(new Date(r.createTime).getTime() / 1000)
                }));
            }
        } else if (googleApiKey) {
            // Fallback to Places API (5 reviews limit)
            console.log(`Using Places API fallback for place_id: ${place_id}`);
            const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${googleApiKey}`;
            const googleResponse = await fetch(googleUrl);
            const googleData = await googleResponse.json();

            if (googleData.status === 'OK') {
                googleReviews = googleData.result?.reviews || [];
            } else {
                console.error(`Google Places API error: ${googleData.status}`);
            }
        }

        console.log(`Found ${googleReviews.length} reviews to import`);

        const reviewsToInsert = googleReviews.map((review: any) => ({
            business_id,
            author_name: review.author_name || 'Anonymous',
            author_email: null,
            rating: review.rating || 5,
            review_text: review.text || review.comment || '',
            review_source: 'google',
            external_id: `gmb_${review.time}_${(review.author_name || 'anon').replace(/\s+/g, '_').toLowerCase()}`,
            created_at: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
            external_metadata: {
                original_review: review,
                source_api: access_token ? 'gmb_v4' : 'places_api'
            }
        }));

        if (reviewsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('your_reviews')
                .upsert(reviewsToInsert, { onConflict: 'external_id' });

            if (insertError) throw insertError;
        }

        // Mark as completed
        const { error: updateError } = await supabase
            .from('business_listings')
            .update({ gmb_import_completed: true })
            .eq('id', business_id);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                success: true,
                count: reviewsToInsert.length,
                message: `Successfully imported ${reviewsToInsert.length} reviews`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in import-gmb-reviews:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
