import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { host_id, interaction_type, trigger_link_id, source, service_id } = await req.json();

    if (!host_id || !interaction_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: host_id and interaction_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate interaction type
    const validTypes = ['profile_view', 'click_to_call', 'button_click', 'form_submit', 'unit_view', 'unit_inquiry'];
    if (!validTypes.includes(interaction_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid interaction_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP and user agent from headers
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || 'unknown';
    
    // Simple hash of IP for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert interaction
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert({
        host_id,
        interaction_type,
        trigger_link_id: trigger_link_id || null,
        source: source || null,
        service_id: service_id || null,
        ip_hash: ipHash,
        user_agent: userAgent.substring(0, 500) // Limit length
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting interaction:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track interaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tracked interaction:', interaction_type, 'for host:', host_id);

    return new Response(
      JSON.stringify({ success: true, interaction_id: interaction.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-interaction:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});