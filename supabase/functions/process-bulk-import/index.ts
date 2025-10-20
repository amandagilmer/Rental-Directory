import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  business_name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  image_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { rows, importId } = await req.json();
    console.log(`Processing bulk import ${importId} for user ${user.id}, ${rows.length} rows`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as ImportRow;
      
      // Validate required fields
      if (!row.business_name || !row.category) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: 'Missing required fields: business_name and category are required',
        });
        continue;
      }

      // Insert business listing
      const { error: insertError } = await supabaseClient
        .from('business_listings')
        .insert({
          user_id: user.id,
          business_name: row.business_name,
          category: row.category,
          description: row.description || null,
          phone: row.phone || null,
          email: row.email || null,
          website: row.website || null,
          address: row.address ? `${row.address}, ${row.city || ''}, ${row.state || ''} ${row.zip || ''}`.trim() : null,
          image_url: row.image_url || null,
          is_published: true,
        });

      if (insertError) {
        console.error(`Error inserting row ${i + 1}:`, insertError);
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: insertError.message,
        });
      } else {
        results.successful++;
      }
    }

    // Update import history
    await supabaseClient
      .from('import_history')
      .update({
        successful_rows: results.successful,
        failed_rows: results.failed,
        status: results.failed === 0 ? 'completed' : 'completed_with_errors',
        error_log: results.errors.length > 0 ? results.errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importId);

    console.log(`Import ${importId} completed: ${results.successful} successful, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing bulk import:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});