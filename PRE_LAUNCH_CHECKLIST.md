# 🚀 Patriot Hauls - Pre-Launch Checklist

This document tracks critical setup tasks that must be completed before going live with real customers.

---

## 🔴 HIGH PRIORITY - Blocking Live Payments

### Stripe Integration
- [ ] **Create Stripe Products & Prices**
    - Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
    - Create products for: `Pro`, `Premium`, `Enterprise`
    - Copy each **Price ID** (starts with `price_...`)
- [ ] **Update `Pricing.tsx` with Real Price IDs**
    - Replace `price_pro_placeholder`, `price_premium_placeholder`, etc. with your real Stripe Price IDs
    - File: `src/pages/Pricing.tsx`
- [ ] **Update `subscription_plans` Table**
    - Add your Stripe Price IDs to the `stripe_price_id` column in the database
    - This links your database plans to Stripe plans
- [ ] **Deploy Edge Functions**
    - Run: `supabase functions deploy stripe-checkout`
    - Run: `supabase functions deploy stripe-webhook`
    - Run: `supabase functions deploy stripe-portal`
- [ ] **Test a Real Checkout Flow**
    - Use Stripe test cards (e.g., `4242 4242 4242 4242`)
    - Confirm user's plan updates automatically after payment

---

## 🟡 MEDIUM PRIORITY - Before Public Launch

### Security & RLS
- [ ] Review all RLS policies for production readiness
- [ ] Ensure no development/test accounts have admin access

### Environment
- [ ] Switch Stripe keys from `sk_test_...` to `sk_live_...` when ready for real payments
- [ ] Update webhook endpoint in Stripe Dashboard to use production URL

### DNS & Hosting
- [ ] Configure custom domain
- [ ] Set up SSL certificate

---

## 🟢 LOW PRIORITY - Nice to Have

- [ ] Set up Stripe Tax for automatic tax calculation
- [ ] Configure email notifications for failed payments
- [ ] Add analytics tracking (Google Analytics, Mixpanel, etc.)

---

> **Last Updated:** January 13, 2026
