
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Bypass RLS
        const apiKey = Deno.env.get('OPENAI_API_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey });

        // 1. Fetch document (Hardcoded for this fix)
        const docId = 2;
        const { data: doc, error: fetchError } = await supabase
            .from('support_documents')
            .select('content')
            .eq('id', docId)
            .single();

        if (fetchError || !doc) throw new Error(`Doc fetch failed: ${JSON.stringify(fetchError)}`);

        // 2. Generate Embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: doc.content,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // 3. Update DB
        const { error: updateError } = await supabase
            .from('support_documents')
            .update({ embedding })
            .eq('id', docId);

        if (updateError) throw new Error(`Update failed: ${JSON.stringify(updateError)}`);

        return new Response(JSON.stringify({ success: true, message: "Embedding updated" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
