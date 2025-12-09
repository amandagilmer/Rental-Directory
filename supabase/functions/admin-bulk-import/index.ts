import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  business_name: string;
  category: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  hours_json?: string;
  services_json?: string;
}

async function fetchAndUploadLogo(
  supabaseClient: any,
  logoUrl: string,
  businessName: string
): Promise<string | null> {
  try {
    console.log(`Fetching logo for ${businessName}: ${logoUrl.substring(0, 50)}...`);
    
    // Check if it's a base64 string
    if (logoUrl.startsWith('data:image')) {
      const matches = logoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return null;
      
      const extension = matches[1];
      const base64Data = matches[2];
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `${Date.now()}-${businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${extension}`;
      const filePath = `logos/${fileName}`;
      
      const { data, error } = await supabaseClient.storage
        .from('business-photos')
        .upload(filePath, buffer, {
          contentType: `image/${extension}`,
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading base64 logo:', error);
        return null;
      }
      
      const { data: urlData } = supabaseClient.storage
        .from('business-photos')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    }
    
    // Fetch from URL
    const response = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BusinessDirectoryBot/1.0)'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch logo: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.split('/')[1]?.split(';')[0] || 'png';
    const buffer = await response.arrayBuffer();
    
    const fileName = `${Date.now()}-${businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${extension}`;
    const filePath = `logos/${fileName}`;
    
    const { data, error } = await supabaseClient.storage
      .from('business-photos')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
    
    const { data: urlData } = supabaseClient.storage
      .from('business-photos')
      .getPublicUrl(filePath);
    
    console.log(`Logo uploaded successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error processing logo:', error);
    return null;
  }
}

async function checkDuplicate(
  supabaseClient: any,
  businessName: string,
  address: string
): Promise<{ exists: boolean; id?: string }> {
  const fullAddress = address.toLowerCase().trim();
  const name = businessName.toLowerCase().trim();
  
  const { data, error } = await supabaseClient
    .from('business_listings')
    .select('id, business_name, address')
    .ilike('business_name', name);
  
  if (error || !data || data.length === 0) {
    return { exists: false };
  }
  
  // Check for address match
  for (const listing of data) {
    if (listing.address?.toLowerCase().includes(fullAddress) || 
        fullAddress.includes(listing.address?.toLowerCase() || '')) {
      return { exists: true, id: listing.id };
    }
  }
  
  return { exists: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Unauthorized - Admin access required');
    }

    const { rows, skipLogos, duplicateHandling } = await req.json();
    console.log(`Processing admin bulk import for ${rows.length} rows, skipLogos: ${skipLogos}, duplicateHandling: ${duplicateHandling}`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as ImportRow;
      
      try {
        // Check for duplicates
        const fullAddress = `${row.address}, ${row.city}, ${row.state} ${row.zip}`;
        const duplicate = await checkDuplicate(supabaseClient, row.business_name, fullAddress);
        
        if (duplicate.exists) {
          if (duplicateHandling === 'skip') {
            console.log(`Skipping duplicate: ${row.business_name}`);
            results.failed++;
            results.errors.push({
              row: i + 1,
              error: 'Duplicate entry (skipped)',
            });
            continue;
          }
          
          // Update existing
          let imageUrl = null;
          if (row.logo_url && !skipLogos) {
            imageUrl = await fetchAndUploadLogo(supabaseClient, row.logo_url, row.business_name);
            // Add rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const { error: updateError } = await supabaseClient
            .from('business_listings')
            .update({
              category: row.category,
              description: row.description || null,
              phone: row.phone || null,
              email: row.email || null,
              website: row.website || null,
              address: fullAddress,
              image_url: imageUrl || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', duplicate.id);
          
          if (updateError) {
            throw updateError;
          }
          
          console.log(`Updated existing: ${row.business_name}`);
          results.successful++;
          continue;
        }

        // Process logo if provided
        let imageUrl = null;
        if (row.logo_url && !skipLogos) {
          imageUrl = await fetchAndUploadLogo(supabaseClient, row.logo_url, row.business_name);
          // Add rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Insert new business listing (assign to admin user, unpublished by default)
        const { data: insertData, error: insertError } = await supabaseClient
          .from('business_listings')
          .insert({
            user_id: user.id,
            business_name: row.business_name,
            category: row.category,
            description: row.description || null,
            phone: row.phone || null,
            email: row.email || null,
            website: row.website || null,
            address: fullAddress,
            image_url: imageUrl,
            is_published: false, // Unpublished by default for review
          })
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }

        const listingId = insertData.id;

        // Process hours if provided
        if (row.hours_json) {
          try {
            const hours = JSON.parse(row.hours_json);
            const dayMap: Record<string, number> = {
              sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
              thursday: 4, friday: 5, saturday: 6
            };
            
            const hoursInserts = Object.entries(hours).map(([day, times]: [string, any]) => ({
              listing_id: listingId,
              day_of_week: dayMap[day.toLowerCase()] ?? 0,
              open_time: times.open || null,
              close_time: times.close || null,
              is_closed: times.closed || false,
            }));
            
            if (hoursInserts.length > 0) {
              await supabaseClient.from('business_hours').insert(hoursInserts);
            }
          } catch (e) {
            console.error('Error parsing hours:', e);
          }
        }

        // Process services if provided
        if (row.services_json) {
          try {
            const services = JSON.parse(row.services_json);
            const serviceInserts = services.map((service: any, index: number) => ({
              listing_id: listingId,
              service_name: service.name || service.service_name,
              description: service.description || null,
              price: service.price ? parseFloat(service.price) : null,
              price_unit: service.unit || service.price_unit || 'per day',
              display_order: index,
            }));
            
            if (serviceInserts.length > 0) {
              await supabaseClient.from('business_services').insert(serviceInserts);
            }
          } catch (e) {
            console.error('Error parsing services:', e);
          }
        }

        results.successful++;
        console.log(`Successfully imported: ${row.business_name}`);
      } catch (error) {
        console.error(`Error importing row ${i + 1}:`, error);
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Import completed: ${results.successful} successful, ${results.failed} failed`);

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
    console.error('Error in admin bulk import:', error);
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
