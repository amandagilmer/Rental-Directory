
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY; // Using anon key, hope RLS allows insert or use service role if available?
// Actually, usually RLS blocks anon inserts. I should check if I have service role key.
// The .env usually has anon key.
// If RLS blocks, I might need to disable RLS temporarily or add a policy.
// Let's assume anon key works if I have a policy "Authenticated users can upload" or similar.
// Wait, migration_resurrection.sql says:
// create policy "Public read access" on public.business_listings for select using (true);
// create policy "Users can manage own listings" on public.business_listings for all using (auth.uid() = user_id);
// It does NOT allow anon inserts.

// I need to use the SERVICE_ROLE_KEY if I want to bypass RLS.
// But I might not have it in .env.
// Let's check .env content (I can't see it directly, but I can try to read it via the script).
// Alternatively, I can temporarily add a policy to allow public inserts for seeding, then remove it.

// Let's modify migration to allow public insert temporarily?
// Or I can use my specialized tool `mcp_supabase-mcp-server_execute_sql` to insert data?
// No, the tool is for SQL. I can generate SQL insert statements!

// Idea: Instead of a TS script using Supabase client, generate a SQL file with INSERT statements and run it using `apply_migration`.
// This bypasses RLS issues because migrations run as admin.
// This is much safer and easier given the tools I have.

// Changed Plan:
// 1. Create a script that Generates SQL.
// 2. Run that SQL using apply_migration.

console.log("Generating SQL for seeding...");

const companiesPath = path.resolve(__dirname, '../src/data/seed_companies.json');
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf-8'));

function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-1]+/g, '-').replace(/(^-|-$)/g, '');
}

let sql = '';

companies.forEach((company: any) => {
    const slug = generateSlug(company.name);
    const category = 'Trailer Rental'; // Default
    const claimed = false;

    // Escape single quotes
    const escape = (str: string) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';

    sql += `
INSERT INTO public.business_listings (
  business_name,
  image_url,
  phone,
  email,
  website,
  city,
  state,
  slug,
  category,
  claimed,
  status,
  is_published
) VALUES (
  ${escape(company.name)},
  ${escape(company.logo_url)},
  ${escape(company.phone)},
  ${escape(company.email)},
  ${escape(company.website)},
  ${escape(company.city)},
  ${escape(company.state)},
  '${slug}',
  '${category}',
  ${claimed},
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;
`;
});

// Write to migration_seed.sql
const outputPath = path.resolve(__dirname, '../migration_seed.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Generated migration_seed.sql at ${outputPath}`);
