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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing code parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up the trigger link
    const { data: link, error: linkError } = await supabase
      .from('trigger_links')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (linkError || !link) {
      console.error('Trigger link not found:', code);
      return new Response(
        JSON.stringify({ error: 'Link not found', redirect: '/' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment click count
    await supabase
      .from('trigger_links')
      .update({ click_count: (link.click_count || 0) + 1 })
      .eq('id', link.id);

    // Get IP and user agent
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || 'unknown';
    
    // Hash IP
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');

    // Map link type to interaction type
    const interactionTypeMap: Record<string, string> = {
      'profile': 'profile_view',
      'call': 'click_to_call',
      'form': 'button_click'
    };

    // Log interaction
    await supabase
      .from('interactions')
      .insert({
        host_id: link.host_id,
        trigger_link_id: link.id,
        interaction_type: interactionTypeMap[link.link_type] || 'button_click',
        source: 'trigger_link',
        ip_hash: ipHash,
        user_agent: userAgent.substring(0, 500)
      });

    console.log('Trigger link clicked:', code, 'Type:', link.link_type, 'Destination:', link.destination);

    return new Response(
      JSON.stringify({ 
        success: true, 
        redirect: link.destination,
        link_type: link.link_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in trigger-redirect:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', redirect: '/' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});