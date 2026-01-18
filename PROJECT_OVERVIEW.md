# PATRIOT HAULS - Project Overview

An all-in-one trailer and equipment rental ecosystem that connects vendors with renters via a powerful, AI-enhanced marketplace.

## 🚀 System Architecture & Tech Stack

The system is built as a modern SaaS platform with a clear separation between the front-end application and back-end services.

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Premium UI components)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL (with RLS for security)
  - **Authentication**: Supabase Auth (Email/Password, Social)
  - **Edge Functions**: Deno-based serverless functions for business logic
  - **Storage**: Supabase Storage for business images and logos
  - **Realtime**: Database change listeners for live updates (Chat, Leads)
- **Integrations**:
  - **Payments**: [Stripe](https://stripe.com/) for subscriptions and feature gating
  - **AI**: [OpenAI](https://openai.com/) for description enhancement, review responses, and support chatbots
  - **Location**: [Google Maps/Places API](https://developers.google.com/maps) for address geocoding and autocomplete
  - **Business Data**: [Google My Business](https://www.google.com/business/) for review syncing

---

## 🛠 Directory Breakdown

```text
/
├── src/
│   ├── components/      # Reusable UI components (buttons, cards, forms)
│   ├── hooks/           # Custom React hooks (useAuth, useLeads, etc.)
│   ├── pages/           # Main route components
│   │   ├── admin/       # Pages specific to the Super Admin (HQ)
│   │   ├── dashboard/   # Pages specific to Vendors (Command Center)
│   │   └── ...          # Public-facing renter pages
│   ├── integrations/    # Supabase initialization and type definitions
│   └── lib/             # Third-party library configurations
├── supabase/
│   ├── functions/       # Serverless Edge Functions (AI, Stripe, GMB)
│   └── migrations/      # Database schema and RLS policy versioning
├── scripts/             # Internal tools for data management (bulk seeding)
├── public/              # Static assets (images, icons)
└── tailwind.config.ts   # UI design system tokens (colors, spacing)
```

---

## 👑 Admin HQ (Super Administrator)
*The central command for the platform owner to manage the entire ecosystem.*

- **Dashboard Overview**: Macro-level metrics on users, businesses, leads, and revenue.
- **User Management**: Comprehensive control over all user accounts (Ban, Delete, Role Assignment).
- **Listing & Category Management**: Approval of new listings and dynamic management of rental categories.
- **Claim Processing**: Validating and approving business ownership claims.
- **Lead & Support Management**: Monitoring platform-wide leads and handling support tickets (Live Chat/Knowledge Base).
- **Marketing & Content**: Full CMS for the platform Blog and FAQ sections.
- **Badges & Trust**: Awarding specialized badges (e.g., "Verified Vendor") to businesses.
- **Bulk Operations**: Powerful tools for importing large datasets of businesses and trailers.

---

## 🚛 Vendor Command Center (Business Owner)
*A dedicated portal for vendors to grow their business and manage operations.*

- **Business Profile Management**: Control over logo, description, social links, and business hours.
- **Listing Management**: Add, edit, or remove trailers and rental units with AI-enhanced descriptions.
- **Command Center Overview**: Real-time stats on listing performance, lead counts, and subscription status.
- **Lead Inbox**: Centralized dashboard to view and respond to renter inquiries.
- **Review Center**: Manage customer reviews with AI-generated response suggestions and GMB sync.
- **GMB Integration**: Link Google My Business to pull in existing reputation data.
- **Marketing Tools (Trigger Links)**: Generate trackable marketing links to drive traffic to specific units.
- **Subscription Management**: Access to Stripe-powered plans to unlock premium features and increase visibility.

---

## 🏠 Renter View (Public Marketplace)
*A high-conversion frontend designed for ease of use and discovery.*

- **Smart Search**: Find equipment by category, location, and equipment type.
- **Detailed Listings**: High-quality views of business profiles and individual trailer units.
- **AI Concierge**: Interactive chatbots to help renters find the right equipment or answer support questions.
- **Trust Elements**: Visibility of verified badges, business reputation, and verified reviews.
- **Streamlined Inquiry Flow**: One-click "Claim Unit" or lead submission to contact vendors directly.
- **Educational Content**: Access to FAQs, detailed "Badge Explainers," and industry-relevant blog posts.
- **Profile Center**: Renters can manage their own inquiries (tickets) and see response status.

---

## 🔄 Core Workflows

1. **The Business Lifecycle**: Vendor joins → Claims/Creates Listing → Subscribes via Stripe → Lists Equipment → Receives Leads via Inbox → Manages Reputation (Reviews).
2. **The Renter Lifecycle**: Searches equipment → Uses AI Chat for guidance → Submits Inquiry (Lead) → Vendor responds → Transaction (Offline/Manual) → Renter leaves Review.
3. **The Data Loop**: Reviews and leads are tracked globally by Admin for analytics and quality control.
