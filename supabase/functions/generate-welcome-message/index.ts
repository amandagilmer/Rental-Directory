import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Patriot Hauls brand voice welcome messages
const fallbackMessages = [
  "Rise and grind, Operator. Your fleet is Mission Ready.",
  "Another day in the brotherhood. Let's get to work.",
  "Your numbers are looking strong. Keep hauling freedom.",
  "The network's got your back. Time to make moves.",
  "Time to turn contacts into customers. You've got this.",
  "Built by blue-collar, owned by blue-collar. That's you.",
  "Welcome back to the Command Center. Mission awaits.",
  "The brotherhood stands ready. What's the play today?",
  "Patriots don't wait for opportunities. They create them.",
  "Your territory, your rules. Let's dominate.",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operatorName, stats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // If no API key, return a random fallback message
    if (!LOVABLE_API_KEY) {
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      return new Response(
        JSON.stringify({ message: randomMessage, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    const contextParts = [];
    if (operatorName) contextParts.push(`Operator name: ${operatorName}`);
    if (stats?.newLeads > 0) contextParts.push(`${stats.newLeads} new contact(s) waiting`);
    if (stats?.totalViews > 0) contextParts.push(`${stats.totalViews} intel hits this week`);
    if (stats?.reviewScore) contextParts.push(`Rating: ${stats.reviewScore} stars`);
    
    const context = contextParts.length > 0 ? contextParts.join('. ') + '.' : 'No specific stats available.';

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
            content: `You are the voice of Patriot Hauls - a brotherhood of blue-collar American trailer and equipment rental operators. Generate a single SHORT welcome message (max 15 words) for an operator logging into their Command Center dashboard.

BRAND VOICE RULES:
- Sound like a foreman who's got their back, a veteran who tells it straight
- Direct, not corporate. Proud, not arrogant. Warm, not soft. Real, not polished.
- Use working-class language: "rig", "haul", "mission ready", "brotherhood", "fleet"
- Reference their stats if provided to make it personal
- Never sound like HR or a Silicon Valley startup
- No emojis, no exclamation marks, end with a period

EXAMPLES:
- "Rise and grind, Operator. Your fleet is Mission Ready."
- "Three new contacts waiting. Time to close some deals."
- "The brotherhood stands strong. 47 operators online right now."
- "Your numbers are up 20% this week. Keep hauling freedom."`
          },
          {
            role: "user",
            content: `Generate a welcome message. Context: ${context}`
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      return new Response(
        JSON.stringify({ message: randomMessage, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content?.trim() || 
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    console.log("Generated welcome message:", aiMessage);

    return new Response(
      JSON.stringify({ message: aiMessage, source: 'ai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating welcome message:", error);
    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    return new Response(
      JSON.stringify({ message: randomMessage, source: 'fallback' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
