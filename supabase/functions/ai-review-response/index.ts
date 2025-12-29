import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewText, rating, authorName, businessName, tone = 'professional' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneInstructions = {
      professional: "Write in a professional, courteous tone.",
      friendly: "Write in a warm, friendly, and personable tone.",
      formal: "Write in a formal, business-appropriate tone.",
    };

    const systemPrompt = `You are an expert at crafting professional responses to customer reviews for rental businesses. 

${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}

Guidelines:
- Thank the customer by name
- Acknowledge their specific feedback
- For positive reviews (4-5 stars): Express gratitude and invite them back
- For neutral reviews (3 stars): Thank them and address any concerns
- For negative reviews (1-2 stars): Apologize sincerely, take responsibility, offer to make it right
- Keep responses concise (2-4 sentences)
- Sign off with the business name
- Never be defensive or argumentative
- Always maintain professionalism`;

    const userPrompt = `Write a response to this ${rating}-star review from ${authorName} for ${businessName}:

"${reviewText}"

Generate a thoughtful, appropriate response.`;

    console.log("AI Review Response - Generating for", rating, "star review");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0]?.message?.content || "";

    console.log("AI Review Response - Generated successfully");

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Review Response error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
