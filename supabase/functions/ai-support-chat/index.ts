
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { message, history } = await req.json()
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        if (!openAiApiKey) {
            throw new Error('OpenAI API key not configured')
        }

        // 1. Fetch Context (FAQs and Pages)
        // We'll fetch all public FAQs and published pages to use as context
        const { data: faqs } = await supabase
            .from('faqs')
            .select('question, answer')
            .eq('is_published', true)

        const { data: pages } = await supabase
            .from('pages')
            .select('title, content')

        // Format context
        let contextText = "You are a helpful support assistant for 'Patriot Hauls', a trailer rental platform.\n\n"
        contextText += "Here is the knowledge base you should use to answer questions:\n\n"

        if (faqs && faqs.length > 0) {
            contextText += "### Frequently Asked Questions:\n"
            faqs.forEach(faq => {
                contextText += `Q: ${faq.question}\nA: ${faq.answer}\n\n`
            })
        }

        if (pages && pages.length > 0) {
            contextText += "### General Information:\n"
            pages.forEach(page => {
                contextText += `Title: ${page.title}\nContent: ${page.content}\n\n`
            })
        }

        contextText += "\n\nIf you don't know the answer based on this context, politely say so and suggest they submit a formal ticket for a human agent. Do not make up information."

        // 2. Call OpenAI
        const messages = [
            { role: 'system', content: contextText },
            ...history.map((msg: any) => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ]

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                stream: true,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Failed to get AI response')
        }

        // Stream the response back
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const stream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    controller.enqueue(value)
                }
                controller.close()
            },
        })

        return new Response(stream, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream'
            },
        })

    } catch (error) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
