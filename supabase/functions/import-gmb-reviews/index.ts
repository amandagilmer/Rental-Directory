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
        const { business_id, place_id } = await req.json();

        if (!business_id || !place_id) {
            return new Response(
                JSON.stringify({ error: 'business_id and place_id are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if already imported
        const { data: business, error: bizError } = await supabase
            .from('business_listings')
            .select('gmb_import_completed')
            .eq('id', business_id)
            .single();

        if (bizError) throw bizError;
        if (business.gmb_import_completed) {
            return new Response(
                JSON.stringify({ message: 'GMB reviews already imported for this business' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!googleApiKey) {
            throw new Error('GOOGLE_PLACES_API_KEY not configured');
        }

        console.log(`Importing GMB reviews for place_id: ${place_id}`);
        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${googleApiKey}`;

        const googleResponse = await fetch(googleUrl);
        const googleData = await googleResponse.json();

        if (googleData.status !== 'OK') {
            throw new Error(`Google API error: ${googleData.status}`);
        }

        const googleReviews = googleData.result?.reviews || [];
        console.log(`Found ${googleReviews.length} reviews to import`);

        const reviewsToInsert = googleReviews.map((review: any) => ({
            business_id,
            author_name: review.author_name || 'Anonymous',
            author_email: null, // We don't get email from Google
            rating: review.rating || 5,
            review_text: review.text || '',
            review_source: 'google',
            external_id: `gmb_${review.time}_${review.author_name.replace(/\s+/g, '_').toLowerCase()}`,
            created_at: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
            external_metadata: {
                original_review: review,
                author_url: review.author_url,
                profile_photo_url: review.profile_photo_url,
                relative_time_description: review.relative_time_description
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
