import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_id, place_id } = await req.json();
    
    console.log(`Fetching GMB reviews for business: ${business_id}, place_id: ${place_id}`);

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: 'business_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for cached reviews that haven't expired
    const { data: cachedReviews, error: cacheError } = await supabase
      .from('gmb_reviews')
      .select('*')
      .eq('business_id', business_id)
      .gt('expires_at', new Date().toISOString())
      .order('rating', { ascending: false })
      .limit(3);

    if (cacheError) {
      console.error('Error fetching cached reviews:', cacheError);
    }

    // If we have valid cached reviews, return them
    if (cachedReviews && cachedReviews.length > 0) {
      console.log(`Returning ${cachedReviews.length} cached reviews`);
      return new Response(
        JSON.stringify({ reviews: cachedReviews, source: 'cache' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no place_id, we can't fetch from Google
    if (!place_id) {
      console.log('No place_id provided, cannot fetch from Google');
      return new Response(
        JSON.stringify({ reviews: [], source: 'none', message: 'No place_id configured for this business' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Google API key is configured
    if (!googleApiKey) {
      console.log('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ reviews: [], source: 'none', message: 'Google Places API not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Google Places API
    console.log(`Fetching reviews from Google Places API for place_id: ${place_id}`);
    
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${googleApiKey}`;
    
    const googleResponse = await fetch(googleUrl);
    const googleData = await googleResponse.json();

    if (googleData.status !== 'OK') {
      console.error('Google Places API error:', googleData.status, googleData.error_message);
      return new Response(
        JSON.stringify({ reviews: [], source: 'error', message: googleData.error_message || googleData.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleReviews = googleData.result?.reviews || [];
    console.log(`Received ${googleReviews.length} reviews from Google`);

    // Delete old cached reviews for this business
    await supabase
      .from('gmb_reviews')
      .delete()
      .eq('business_id', business_id);

    // Take top 3 reviews and cache them
    const topReviews = googleReviews.slice(0, 3);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const reviewsToInsert = topReviews.map((review: any) => ({
      business_id,
      author: review.author_name || 'Anonymous',
      rating: review.rating || 5,
      review_text: review.text || '',
      review_date: review.time ? new Date(review.time * 1000).toISOString().split('T')[0] : null,
      fetched_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    if (reviewsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('gmb_reviews')
        .insert(reviewsToInsert);

      if (insertError) {
        console.error('Error caching reviews:', insertError);
      } else {
        console.log(`Cached ${reviewsToInsert.length} reviews`);
      }
    }

    // Fetch the newly inserted reviews to return
    const { data: newCachedReviews } = await supabase
      .from('gmb_reviews')
      .select('*')
      .eq('business_id', business_id)
      .order('rating', { ascending: false })
      .limit(3);

    return new Response(
      JSON.stringify({ reviews: newCachedReviews || [], source: 'google' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in get-gmb-reviews function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
