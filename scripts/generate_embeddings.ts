
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using anon key, hope RLS allows update? No, need service role or be admin.
// Wait, the anon key won't work easily for updating unless we are logged in.
// Does the user have SERVICE_ROLE key in .env? Likely no.
// But we have the OPENAI_API_KEY now.
// For the script to work, we need a way to auth.
// We can use the user's ANNOYINGLY LONG JWT from the browser... or just use the OpenAI key to get embeddings and PRINT the SQL to run?
// OR, since I have `execute_sql` tool, I can just use the script to print the SQL updates.
// Let's try to find a Service Role key or just use printing SQL.

const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});


async function main() {
    const textToEmbed = "Policies: All rentals are 24 hours minimum. Cancellations must be made 48 hours in advance.";
    const docId = 2; // From the previous SQL query result

    console.log(`Generating embedding for: "${textToEmbed}"`);

    try {
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textToEmbed,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Output the vector as a JSON string mostly, but formatted for SQL if needed.
        // pgvector format is just `[1,2,3]` in string.
        console.log("SQL_START");
        console.log(`UPDATE support_documents SET embedding = '${JSON.stringify(embedding)}' WHERE id = ${docId};`);
        console.log("SQL_END");

    } catch (e) {
        console.error(`Error generating embedding:`, e);
    }
}

main();

