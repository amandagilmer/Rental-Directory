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
    const { currentDescription, itemName, itemType, features, specs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert copywriter specializing in rental equipment and trailer listings. Write compelling, SEO-friendly descriptions that convert browsers into renters.

Guidelines:
- Write clear, engaging descriptions (100-200 words)
- Highlight key benefits and features
- Use action-oriented language
- Include relevant keywords naturally
- Mention ideal use cases
- Create urgency where appropriate
- Be accurate and honest
- Format with short paragraphs for readability`;

    let userPrompt = `Write a compelling rental listing description for: ${itemName}`;
    
    if (itemType) {
      userPrompt += `\nType: ${itemType}`;
    }
    
    if (features && features.length > 0) {
      userPrompt += `\nFeatures: ${features.join(', ')}`;
    }
    
    if (specs) {
      userPrompt += `\nSpecs: ${JSON.stringify(specs)}`;
    }
    
    if (currentDescription) {
      userPrompt += `\n\nCurrent description to enhance: "${currentDescription}"`;
    } else {
      userPrompt += `\n\nNo existing description - write a fresh one from scratch.`;
    }

    console.log("AI Description Enhancer - Processing for:", itemName);

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
    const enhancedDescription = data.choices[0]?.message?.content || "";

    console.log("AI Description Enhancer - Generated successfully");

    return new Response(JSON.stringify({ description: enhancedDescription }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Description Enhancer error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
