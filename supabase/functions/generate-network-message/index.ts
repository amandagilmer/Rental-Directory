import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin-focused fallback messages
const fallbackMessages = [
  "Network strong. Operators standing ready across America.",
  "The brotherhood grows stronger every day.",
  "HQ monitoring all sectors. Systems nominal.",
  "Working-class America is building something big.",
  "Coast to coast coverage expanding. Mission on track.",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { networkStats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      return new Response(
        JSON.stringify({ message: randomMessage, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context
    const contextParts = [];
    if (networkStats?.totalOperators) contextParts.push(`${networkStats.totalOperators} total operators`);
    if (networkStats?.activeToday) contextParts.push(`${networkStats.activeToday} active today`);
    if (networkStats?.newLeads) contextParts.push(`${networkStats.newLeads} new leads today`);
    if (networkStats?.pendingVerifications) contextParts.push(`${networkStats.pendingVerifications} pending verifications`);
    
    const context = contextParts.length > 0 ? contextParts.join('. ') + '.' : 'Network operational.';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are generating a status message for the Patriot Hauls admin HQ dashboard. This is for network administrators overseeing the brotherhood of operators.

Generate a single SHORT status message (max 12 words) that sounds like a military command center status update.

STYLE:
- Professional but not corporate
- Reference network stats if provided
- Sound authoritative and confident
- No emojis, end with a period

EXAMPLES:
- "Network strong. 47 operators active across 23 states."
- "All systems nominal. Brotherhood standing ready."
- "12 new leads flowing. The machine is working."`
          },
          {
            role: "user",
            content: `Generate an HQ status message. Context: ${context}`
          }
        ],
        max_tokens: 30,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      return new Response(
        JSON.stringify({ message: randomMessage, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content?.trim() || 
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return new Response(
      JSON.stringify({ message: aiMessage, source: 'ai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error:", error);
    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    return new Response(
      JSON.stringify({ message: randomMessage, source: 'fallback' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
