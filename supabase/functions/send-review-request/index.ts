import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewRequestPayload {
  lead_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_id }: ReviewRequestPayload = await req.json();
    console.log("Processing review request for lead:", lead_id);

    // Fetch lead details with business info
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .maybeSingle();

    if (leadError || !lead) {
      console.error("Lead not found:", leadError);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email already sent
    if (lead.review_email_sent) {
      console.log("Review email already sent for this lead");
      return new Response(
        JSON.stringify({ message: "Email already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business name
    const { data: business } = await supabase
      .from("business_listings")
      .select("business_name")
      .eq("id", lead.business_id)
      .maybeSingle();

    const businessName = business?.business_name || "the vendor";
    
    const baseUrl = Deno.env.get("SITE_URL") || "https://qhzefqdrucocwzmadbvr.lovable.app";
    const finalReviewUrl = `${baseUrl}/review/${lead.review_token}`;

    console.log("Sending review request email to:", lead.email);
    console.log("Review URL:", finalReviewUrl);

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Local Rental Directory <onboarding@resend.dev>",
        to: [lead.email],
        subject: `Rate your experience with ${businessName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rate Your Experience</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${lead.name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for contacting <strong>${businessName}</strong> through Local Rental Directory!
              </p>
              <p style="font-size: 16px; margin-bottom: 25px;">
                We'd love to hear about your experience. Your feedback helps other customers make informed decisions.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${finalReviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Leave a Review
                </a>
              </div>
              <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                This link is unique to you and will expire in 30 days.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Local Rental Directory. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent response:", emailData);

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    // Mark email as sent
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        review_email_sent: true,
        review_email_sent_at: new Date().toISOString(),
      })
      .eq("id", lead_id);

    if (updateError) {
      console.error("Failed to update lead:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, emailData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending review request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
