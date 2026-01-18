import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

serve(async (req) => {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const stripe = new Stripe(stripeSecretKey!, {
        apiVersion: '2022-11-15',
        httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    let event;
    try {
        const body = await req.text();
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            endpointSecret!,
            undefined,
            Stripe.createSubtleCryptoProvider()
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`Processing event: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;

                if (userId) {
                    // Get the line items to find the price ID
                    const order = await stripe.checkout.sessions.listLineItems(session.id);
                    const priceId = order.data[0]?.price?.id;

                    if (priceId) {
                        // Find the plan in our database
                        const { data: plan } = await supabase
                            .from('subscription_plans')
                            .select('id, name')
                            .eq('stripe_price_id', priceId)
                            .maybeSingle();

                        if (plan) {
                            await supabase
                                .from('profiles')
                                .update({
                                    plan_id: plan.id,
                                    plan: plan.name,
                                    subscription_status: 'active'
                                })
                                .eq('id', userId);

                            console.log(`User ${userId} upgraded to ${plan.name}`);
                        }
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Downgrade user to Free
                const { data: freePlan } = await supabase
                    .from('subscription_plans')
                    .select('id, name')
                    .eq('name', 'Free')
                    .single();

                if (freePlan) {
                    await supabase
                        .from('profiles')
                        .update({
                            plan_id: freePlan.id,
                            plan: 'Free',
                            subscription_status: 'canceled'
                        })
                        .eq('stripe_customer_id', customerId);

                    console.log(`Customer ${customerId} subscription deleted. Downgraded to Free.`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const planStatus = subscription.status; // active, past_due, etc.

                await supabase
                    .from('profiles')
                    .update({ subscription_status: planStatus })
                    .eq('stripe_customer_id', customerId);

                console.log(`Customer ${customerId} subscription updated to ${planStatus}`);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
