PATRIOT HAULS DIRECTORY
Complete Vibe-Coding Specification
"Workers United. America Strong."

---

# 🗺️ Master Roadmap
- [x] **Project Foundation**: military-themed UI, core directory structure.
- [x] **Business Management**: Claim flow, business profiles, fleet management.
- [x] **Admin Ecosystem**: Badges, reviews, claims, support, and user management.
- [/] **Monetization & Scale**: Stripe integration, subscription handling, GMB imports.
- [ ] **AI Integration**: Chatbot, AI response suggestions, embedding-based search.
- [x] **Launch**: Production deployment active on Vercel.

- Stable Production Deployment fixed (OpenAI module evaluation issues resolved).
- Active CI/CD: Pushes to `main` branch auto-deploy to Vercel.
- Resuming core feature development (Stripe, GMB Import).

# 🚥 Squad Status
| Agent | Task | Status |
| :--- | :--- | :--- |
| 🐎 Design Lead | UI/Visual Excellence (Military/Patriot Theme) | ✅ Dashboard Revamp |
| 🏗️ Builder | Stripe Integration & GMB Review Sync | [/] In Progress |
| 🤓 Nerd | QC & Testing | [ ] Pending Audit |
| 📚 Researcher | Data & Strategy | ✅ Initial Spec |

---



OVERVIEW
What We're Building: A national directory for trailer and equipment rentals that connects blue-collar Americans with vetted, patriot-owned rental businesses. This is not just a listing site — it's a movement disguised as a directory.
Tech Stack: Lovable or Google AI Studio (vibe-coded)
Branding: Military-themed UI language, Grunt Style aesthetic, working-class pride
Initial Data: 128 AutomateBoss customers (with logos) + 500 additional operators (basic info only)
Monetization: Free basic listings now, lead monetization later via click tracking
---


CORE PAGES & STRUCTURE
## 1. PUBLIC PAGES (Consumer-Facing)
### 1.1 Homepage
* Hero Section:

   * Headline: "HAUL FREEDOM" or "Find Trusted Trailer Rentals Near You"
   * Subhead: "Professional-grade equipment from vetted patriot-owned businesses"
   * Search bar: Location input (zip code, city, or "near me")
   * Category quick-select buttons: Trailers | Equipment
   * Search/Filter Bar:

      * Location (zip code, city, GPS "near me")
      * Class dropdown: Trailer / Equipment
      * Sub-class dropdown (dynamic based on class selection)
      * Distance radius slider (10-100 miles)
      * Price range filter
      * Sort by: Distance / Price (Low-High) / Price (High-Low) / Rating
      * Results Display:

         * Map view (Google Maps integration) showing operators/units
         * List view with operator cards
         * Toggle between map and list view
         * Trust Banner:

            * "Every operator is vetted, insured, and accountable"
            * "200+ operators | 500+ heavy-duty units | 100% patriot-owned"
            * Badge Explainer Link:

               * "What do our badges mean?" → Links to Badge Explainer Page
               * Footer:

                  * About Patriot Hauls
                  * For Business Owners (Claim Your Business CTA)
                  * Badge Meanings
                  * Contact/Support
---


### 1.2 Search Results Page
                  * Map Integration:

                     * Google Maps showing pins for operators/units in search area
                     * Clickable pins show operator name + rating preview
                     * Results Cards (List View):

                        * Operator logo (or placeholder if none)
                        * Business name
                        * Location (city, state)
                        * Star rating (from Patriot Hauls reviews)
                        * Number of reviews
                        * Badges displayed (small icons)
                        * Distance from search location
                        * "View Fleet" button
                        * Filters Sidebar:

                           * Equipment type checkboxes
                           * Price range
                           * Badges filter (e.g., "Veteran Owned only")
                           * Availability toggle
---


### 1.3 Operator Profile Page (Business Listing)
This is the HOST PAGE for each rental business
Header Section:
                           * Business logo (large, prominent)
                           * Business name
                           * Tagline/short description
                           * Badges displayed prominently (Founding Member, Verified, Veteran Owned, etc.)
                           * Overall star rating + review count
                           * "Contact Now" button (click-to-call, tracked)
Contact & Info Section:
                           * Phone number (click-to-call, tracked)
                           * Email (click-to-email, tracked)
                           * Website link (click tracked)
                           * Social media icons (Facebook, Instagram, etc.) — linked
                           * Hours of operation
                           * Service areas (list of cities/counties/regions they serve)
Location Section:
                           * If single location: Address + Google Map embed
                           * If multiple locations:
                           * Dropdown or tabs to select location
                           * Each location shows its own address + map
                           * Units are filterable by location
Fleet Gallery Section:
                           * Unit Icons Grid:
                           * Small thumbnail/icon for each unit
                           * Shows: Unit image, Unit name (e.g., "24ft Car Hauler"), Price range
                           * Clicking a unit icon opens the Unit Detail Page
                           * Filter units by location (if multi-location operator)
Photo Gallery:
                           * Additional photos of the business (yard, shop, team, etc.)
                           * Carousel or grid layout
Reviews Section:
                           * Overall rating (stars)
                           * Total review count
                           * Individual review cards:
                           * Reviewer name (or "Verified Renter")
                           * Star rating
                           * Date
                           * Written review
                           * Operator response (if any)
                           * "See All Reviews" link if more than 5
About Section:
                           * Business description/story
                           * Years in business
                           * Any special certifications or highlights
---


### 1.4 Unit Detail Page
Individual trailer/equipment listing page
Header:
                           * Unit name (e.g., "2024 Big Tex 70PI Heavy Duty Dump Trailer")
                           * Primary photo (large)
                           * Price display: Daily | 3-Day | Weekly | Monthly rates
                           * "Contact to Reserve" button (tracked click)
                           * Availability status toggle (Available / Not Available)
Photo Gallery:
                           * Primary asset photo
                           * Additional photos (carousel)
                           * YouTube video embed (if provided)
Specifications Section:
For Trailers (Combat Specifications):
Field
	Example
	Year/Make/Model
	2024 Big Tex 70PI
	Class
	Trailer
	Sub-Class
	Dump Trailer
	Length (ft)
	20 ft
	Dimensions
	20'L x 6'11"W
	Payload Capacity (lbs)
	7,000 lbs
	Empty Weight (lbs)
	2,200 lbs
	Hitch Connection
	Bumper
	Ball Size (in)
	2-5/16"
	Electrical Plug
	Round 7 Pin
	Traction Type
	Bumper Pull
	Axle Configuration
	Tandem Axle
	For Equipment (different spec fields):
Field
	Example
	Year/Make/Model
	2022 Kubota KX040
	Class
	Equipment
	Sub-Class
	Excavator
	Operating Weight
	9,500 lbs
	Engine HP
	40.4 HP
	Dig Depth
	11'6"
	Fuel Type
	Diesel
	Hours
	850
	Bucket Width
	24"
	Features Section:
                           * List of tactical features (e.g., "Ramps included", "Tarp system", "Tie-down hooks")
Pricing Section (Mission Rates):
Rate Type
	Price
	Daily Signal
	$XX
	3-Day Block
	$XX
	Weekly Deployment
	$XX
	Monthly Garrison
	$XX
	Operator Info:
                           * Small operator card with logo, name, rating
                           * Link to full Operator Profile Page
Description:
                           * Operational Performance Brief (free-text description of capabilities, maintenance status, use cases)
---


### 1.5 Badge Explainer Page
"What Our Badges Mean"
Dedicated page explaining each badge and what it takes to earn it:
⭐ FOUNDING MEMBER
                           * What it means: This operator was among the first 128 businesses to join the Patriot Hauls network. They believed in the mission from day one.
                           * How earned: Joined during founding period (2025)
                           * Visual: Gold star badge
✅ VERIFIED OPERATOR
                           * What it means: This business has been verified as a legitimate, real operation. We've confirmed their identity and business ownership.
                           * How earned: Completed identity verification (driver's license + business verification)
                           * Visual: Blue checkmark badge
🎖️ VETERAN OWNED
                           * What it means: This business is owned by a U.S. military veteran. Thank you for your service.
                           * How earned: Submitted proof of veteran status (DD-214 or VA documentation)
                           * Visual: Military medal badge
🛡️ INSURED & BONDED
                           * What it means: This operator maintains proper business insurance and bonding. Your rental is protected.
                           * How earned: Submitted proof of current insurance coverage
                           * Visual: Shield badge
🏆 TOP RATED
                           * What it means: This operator consistently delivers exceptional service, earning top reviews from verified renters.
                           * How earned: Maintains 4.5+ star average with 10+ reviews
                           * Visual: Trophy badge
🔥 ELITE OPERATOR
                           * What it means: The best of the best. This operator has achieved Top Rated status AND has 50+ completed rentals through the network.
                           * How earned: 4.5+ stars + 50+ verified rentals
                           * Visual: Fire/flame badge
---


## 2. OPERATOR PAGES (Command Center)
### 2.1 Claim Your Business Flow
Step 1: Find Your Business
                           * Search by business name or location
                           * If found: "Is this your business? Claim it now"
                           * If not found: "Add your business to the directory"
Step 2: Create Account
                           * Email
                           * Password
                           * Phone number
                           * Full name
Step 3: Identity Verification
                           * Upload driver's license (front photo)
                           * Selfie holding license (liveness check)
                           * Business verification option: Business license OR utility bill with business name OR bank statement
Step 4: Business Information
                           * Business name
                           * Business address(es) — can add multiple locations
                           * Phone number
                           * Email
                           * Website URL
                           * Social media links (Facebook, Instagram, TikTok, YouTube)
                           * Hours of operation
                           * Service areas (cities, counties, or "nationwide")
                           * Business description
Step 5: Upload Assets
                           * Business logo (required)
                           * Additional business photos (optional, up to 10)
Step 6: Confirmation
                           * "Your claim is under review. We'll verify within 24-48 hours."
                           * Email confirmation sent
---


### 2.2 Command Center (Operator Dashboard)
Dashboard Home:
                           * Welcome message with operator name
                           * Quick stats:
                           * Profile views (this week/month)
                           * Click-to-call count (tracked)
                           * Website clicks (tracked)
                           * Total reviews
                           * Average rating
                           * "Add New Unit" CTA
                           * "Request Reviews" CTA
---


### 2.3 Business Profile Management
Edit Profile Section:
                           * Business name
                           * Logo upload
                           * Business photos (gallery)
                           * Description
                           * Hours of operation
                           * Service areas
Locations Management:
                           * Add/edit/remove locations
                           * Each location has:
                           * Address
                           * Phone (can be different per location)
                           * Hours (can be different per location)
                           * Assign units to this location
Contact Info:
                           * Primary phone
                           * Email
                           * Website URL
                           * Social media links
Badges Display:
                           * Shows current badges earned
                           * Shows badges available to earn + requirements
                           * Upload proof buttons for applicable badges (insurance, veteran status)
---


### 2.4 Fleet Management (Unit Listings)
Unit List View:
                           * Table/grid of all units
                           * Columns: Image thumbnail, Unit name, Class, Sub-class, Daily rate, Status (Active/Inactive), Location
                           * Actions: Edit, Duplicate, Deactivate, Delete
Add/Edit Unit Form:
Mission Briefing Section:
Field
	Type
	Required
	Asset Tactical Name
	Text
	Yes
	Class
	Dropdown (Trailer / Equipment)
	Yes
	Deployment Sub-Class
	Dropdown (dynamic based on class)
	Yes
	Operational Performance Brief
	Textarea
	No
	Sub-Class Options:
For Trailers:
                           * Dump Trailer
                           * Car Hauler
                           * Enclosed Trailer
                           * Flatbed Trailer
                           * Equipment Trailer
                           * Utility Trailer
                           * Gooseneck
                           * Livestock Trailer
For Equipment:
                           * Excavator
                           * Skid Steer
                           * Dumpster
                           * Generator
                           * Mini Excavator
                           * Backhoe
                           * Trencher
                           * Aerial Lift
Combat Specifications Section (Trailers):
Field
	Type
	Year/Make/Model
	Text
	Length (ft)
	Number
	Dimensions
	Text
	Payload Capacity (lbs)
	Number
	Empty Weight (lbs)
	Number
	Hitch Connection
	Dropdown (Bumper / Gooseneck / Fifth Wheel)
	Ball Size (in)
	Text
	Electrical Plug
	Dropdown (Round 7 Pin / Flat 4 Pin / Round 6 Pin)
	Traction Type
	Dropdown (Bumper Pull / Gooseneck / Fifth Wheel)
	Axle Configuration
	Dropdown (Single / Tandem / Triple)
	Combat Specifications Section (Equipment):
Field
	Type
	Year/Make/Model
	Text
	Operating Weight
	Number
	Engine HP
	Number
	Fuel Type
	Dropdown (Diesel / Gas / Electric)
	Hours
	Number
	Dig Depth (if applicable)
	Text
	Lift Height (if applicable)
	Text
	Bucket/Attachment Size
	Text
	Mission Rates Section:
Field
	Type
	Daily Signal ($)
	Number
	3-Day Block ($)
	Number
	Weekly Deployment ($)
	Number
	Monthly Garrison ($)
	Number
	Tactical Features Section:
                           * Dynamic tag/chip input
                           * Add features like: "Ramps included", "Tarp system", "LED lights", "Spare tire", etc.
Asset Visual Gallery Section:
                           * Primary Asset Photo (upload, required)
                           * Additional photos (up to 5)
                           * Action Briefing Video URL (YouTube)
Location Assignment:
                           * If operator has multiple locations: Dropdown to assign unit to specific location
Status Toggle:
                           * "Asset Operational & Available for Deployment" (on/off)
---


### 2.5 Review Management
Reviews Dashboard:
                           * Total reviews count
                           * Average rating
                           * Recent reviews list
Individual Review View:
                           * Reviewer name
                           * Star rating
                           * Date
                           * Written review
                           * "Respond" button (opens response form)
                           * Operator response display (if already responded)
Request Reviews Section:
                           * Input field for customer phone number
                           * Input field for customer email
                           * "Send Review Request" button
                           * Sends SMS + Email with link to leave review
Review Request Tracking:
                           * List of sent requests
                           * Status: Sent / Opened / Completed
                           * Date sent
---


### 2.6 Analytics Dashboard
Click Tracking Stats:
                           * Profile views (daily/weekly/monthly graph)
                           * Click-to-call count
                           * Website click count
                           * Email click count
                           * Social media clicks (broken down by platform)
                           * Unit views (which units are getting the most attention)
Review Stats:
                           * Total reviews
                           * Average rating trend over time
                           * Recent reviews feed
Comparison:
                           * "You're in the top X% of operators in your area"
                           * Benchmark against network averages
---


## 3. REVIEW SYSTEM
### 3.1 Review Collection Flow
For Verified Renters Only:
                           * Renter receives review request via SMS + email
                           * Link takes them to review form
                           * They must verify phone number (SMS code) to confirm they're a real renter
Review Form:
                           1. Star rating (1-5 stars)
                           2. Written review (textarea, min 20 characters)
                           3. Optional: Upload photo of rental experience
                           4. Submit
Review Display:
                           * Shows on Operator Profile Page
                           * Shows "Verified Renter" badge next to reviewer name
                           * Date posted
                           * Star rating
                           * Written content
                           * Operator response (if any)
### 3.2 Review Request System (Paid Tier - Future)
Free Tier:
                           * Operators can manually send review requests (one at a time)
                           * No automated follow-ups
Paid Tier (Future):
                           * Automated 3-step follow-up sequence:
                           * Day 1: Initial request (SMS + Email)
                           * Day 3: Follow-up #1 (SMS + Email)
                           * Day 6: Follow-up #2 (SMS + Email)
                           * Stops automatically if review is submitted
                           * Dashboard shows sequence status for each request
### 3.3 Operator Review Response
                           * Operators can respond to any review (one response per review)
                           * Response shows publicly below the review
                           * Future: AI-powered response suggestions
---


## 4. BADGE SYSTEM
Badge Types & Requirements:
Badge
	Icon
	Requirement
	Verification Method
	Founding Member
	⭐ Gold Star
	Joined during founding period
	Automatic (system-assigned)
	Verified Operator
	✅ Blue Check
	Completed identity verification
	Driver's license + selfie
	Veteran Owned
	🎖️ Medal
	Military veteran owner
	Upload DD-214 or VA docs
	Insured & Bonded
	🛡️ Shield
	Active business insurance
	Upload insurance certificate
	Top Rated
	🏆 Trophy
	4.5+ stars with 10+ reviews
	Automatic (system-calculated)
	Elite Operator
	🔥 Fire
	Top Rated + 50 verified rentals
	Automatic (system-calculated)
	Badge Display:
                           * Badges appear on: Operator cards in search, Operator profile header, Unit listings
                           * Hover/tap on badge shows tooltip with meaning
                           * Link to Badge Explainer Page for full details
---


## 5. SEARCH & DISCOVERY
Search Algorithm Priority:
                           1. Location relevance (closest first by default)
                           2. Badge status (Verified operators rank higher)
                           3. Review rating (higher ratings rank higher)
                           4. Profile completeness (more complete = higher rank)
Filter Options:
                           * Location: Zip code, city, "near me" (GPS)
                           * Distance: 10 / 25 / 50 / 100 miles
                           * Class: Trailer / Equipment
                           * Sub-Class: (dynamic based on class)
                           * Price Range: Min-Max slider
                           * Badges: Checkboxes for each badge type
                           * Availability: Show only available units
Sort Options:
                           * Distance (nearest first)
                           * Price (low to high)
                           * Price (high to low)
                           * Rating (highest first)
                           * Most Reviews
Map Integration:
                           * Google Maps embed
                           * Pins for each operator in search area
                           * Pin click shows: Operator name, rating, "View Profile" link
                           * Cluster pins when zoomed out
---


## 6. CLICK TRACKING SYSTEM
Tracked Actions:
Every click on these elements is logged with timestamp, user session, and source:
Action
	Location
	Data Captured
	Phone Click
	Operator profile, Unit page
	operator_id, timestamp, source_page
	Email Click
	Operator profile
	operator_id, timestamp, source_page
	Website Click
	Operator profile
	operator_id, timestamp, source_page, destination_url
	Social Click
	Operator profile
	operator_id, platform, timestamp
	Unit View
	Search results, Operator profile
	unit_id, operator_id, timestamp
	Profile View
	Search results
	operator_id, timestamp, search_query
	Contact Form Submit
	Unit page (future)
	operator_id, unit_id, timestamp, lead_data
	Analytics Display:
                           * Real-time dashboard for operators
                           * Daily/weekly/monthly breakdowns
                           * Graphs showing trends
                           * Exportable reports (future)
---


## 7. MULTI-LOCATION SUPPORT
How It Works:
Operator Level:
                           * One operator account can have multiple locations
                           * Each location has its own: Address, phone, hours, service area
                           * Operator can assign units to specific locations
Consumer Experience:
                           * On Operator Profile Page: Location selector dropdown or tabs
                           * Selecting a location filters the unit gallery to only show units at that location
                           * Map updates to show selected location
                           * Contact info updates to show location-specific phone/hours
Search Results:
                           * Each location appears as a separate result in search (or grouped under operator name)
                           * Distance calculated from each location
---


## 8. DATA MODEL SUMMARY
Operators Table:
- id
- business_name
- slug (URL-friendly name)
- logo_url
- description
- email
- phone
- website
- social_facebook
- social_instagram
- social_tiktok
- social_youtube
- hours_of_operation (JSON)
- service_areas (JSON array)
- verified (boolean)
- verification_date
- created_at
- updated_at
Locations Table:
- id
- operator_id (FK)
- address_line_1
- address_line_2
- city
- state
- zip_code
- phone
- hours_of_operation (JSON)
- latitude
- longitude
- is_primary (boolean)
Units Table:
- id
- operator_id (FK)
- location_id (FK, nullable)
- name
- class (trailer / equipment)
- sub_class
- description
- year_make_model
- specifications (JSON - dynamic based on class)
- features (JSON array)
- rate_daily
- rate_3day
- rate_weekly
- rate_monthly
- primary_image_url
- images (JSON array of URLs)
- video_url
- is_available (boolean)
- created_at
- updated_at
Reviews Table:
- id
- operator_id (FK)
- reviewer_name
- reviewer_phone (for verification)
- rating (1-5)
- content
- photo_url (optional)
- is_verified (boolean)
- operator_response
- response_date
- created_at
Badges Table:
- id
- operator_id (FK)
- badge_type (founding_member / verified / veteran / insured / top_rated / elite)
- earned_date
- proof_document_url (for manual verification badges)
- is_active (boolean)
Click Tracking Table:
- id
- operator_id (FK)
- unit_id (FK, nullable)
- action_type (phone_click / email_click / website_click / social_click / profile_view / unit_view)
- source_page
- metadata (JSON)
- created_at
Review Requests Table:
- id
- operator_id (FK)
- customer_phone
- customer_email
- status (sent / opened / completed)
- sent_at
- opened_at
- completed_at
- review_id (FK, nullable - links to review if completed)

---
## 9. UI/UX GUIDELINES
Brand Voice:
                           * Military-themed terminology (Command Center, Deploy, Mission, Asset, etc.)
                           * Working-class, blue-collar friendly language
                           * Patriotic but not preachy
                           * Direct, no corporate BS
Color Palette (Clean & Professional Patriot):
                           * Primary Blue: #1E40AF (rich, confident blue - headers, nav, primary buttons)
                           * Accent Red: #DC2626 (clean, vibrant red - CTAs, alerts, emphasis)
                           * White: #FFFFFF (clean backgrounds, cards)
                           * Light Gray: #F8FAFC (subtle section backgrounds, alternating rows)
                           * Dark Text: #1E293B (primary text - easy to read, not harsh black)
                           * Medium Gray: #64748B (secondary text, labels, captions)
                           * Gold Accent: #F59E0B (badges, highlights, premium elements)
                           * Success Green: #16A34A (availability indicators, success states)
                           * Light Blue: #DBEAFE (subtle highlights, hover states, selected items)
Typography:
                           * Headers: Bebas Neue or similar bold condensed font
                           * Body: Roboto or similar clean sans-serif
                           * Industrial, professional feel
Design Elements:
                           * Heavy borders, bold lines
                           * Steel/industrial textures where appropriate
                           * Badge icons prominent and recognizable
                           * Map integration clean and functional
                           * Mobile-first responsive design
Key UX Principles:
                           * Search must be fast and intuitive
                           * Operator profiles must build trust immediately (badges, reviews, photos)
                           * Contact actions (call, email, website) must be prominent and tracked
                           * Claiming a business should feel secure and professional
                           * Command Center should feel empowering, not overwhelming
---


10. ADMIN DASHBOARD (Your Command Center)
### 10.1 Admin Dashboard Overview
This is YOUR backend to run the entire Patriot Hauls operation.
Main Dashboard Home:
                           * Quick Stats Cards:

                              * Total Operators (with trend arrow vs last month)
                              * Total Units Listed (trailers + equipment)
                              * Total Reviews (this month)
                              * Total Leads Generated (this month)
                              * Total Page Views (this month)
                              * Pending Verifications (needs attention badge)
                              * Open Support Tickets (needs attention badge)
                              * Activity Feed:

                                 * Recent operator signups
                                 * Recent reviews submitted
                                 * Recent leads generated
                                 * Recent support tickets
                                 * Charts:

                                    * Leads by day (last 30 days line chart)
                                    * Signups by week (last 12 weeks bar chart)
                                    * Top performing operators (by leads received)
---


### 10.2 Bulk Upload System
CRITICAL FOR LAUNCH: Import your 128 AutomateBoss customers + 500 additional operators
Bulk Upload Page:
                                    * Upload Types:

                                       * Operators (businesses)
                                       * Locations
                                       * Units (trailers/equipment)
                                       * Upload Process:

                                          * Download template (Excel/CSV with correct headers)
                                          * Fill in data
                                          * Upload file
                                          * Preview/validate data (show errors, warnings, duplicates)
                                          * Confirm import
                                          * View import results (success count, error log)
                                          * Template Downloads:

                                             * Operators Template (.xlsx)
                                             * Locations Template (.xlsx)
                                             * Units - Trailers Template (.xlsx)
                                             * Units - Equipment Template (.xlsx)
                                             * Validation Rules:

                                                * Required fields check
                                                * Email format validation
                                                * Phone format validation
                                                * Duplicate detection (by email or business name)
                                                * Location validation (valid state, zip code format)
                                                * Import Options:

                                                   * Skip duplicates / Update duplicates / Flag for review
                                                   * Auto-assign "Founding Member" badge (checkbox)
                                                   * Set all as "Unverified" or "Verified" (dropdown)
                                                   * Send welcome email (checkbox)
                                                   * Import History:

                                                      * Date/time of import
                                                      * File name
                                                      * Records imported / failed
                                                      * Download error log
---


### 10.3 Operators Management
Operators List View:
                                                      * Table Columns:

                                                         * Logo (thumbnail)
                                                         * Business Name (link to edit)
                                                         * Email
                                                         * Phone
                                                         * Location Count
                                                         * Unit Count
                                                         * Verification Status (badge)
                                                         * Badges (icons)
                                                         * Created Date
                                                         * Actions (Edit, View, Delete, Impersonate)
                                                         * Filters:

                                                            * Verification status (All / Verified / Pending / Unverified)
                                                            * Badge type (Founding Member, Veteran, etc.)
                                                            * State/Region
                                                            * Date range (signed up)
                                                            * Has units (Yes / No)
                                                            * Bulk Actions:

                                                               * Mark as Verified
                                                               * Assign Badge
                                                               * Remove Badge
                                                               * Send Email
                                                               * Export Selected
                                                               * Delete Selected
                                                               * Search:

                                                                  * Search by name, email, phone, city
Operator Detail/Edit View:
                                                                  * All operator fields (editable)
                                                                  * Locations list (add/edit/remove)
                                                                  * Units list (view/edit)
                                                                  * Badges (assign/remove with notes)
                                                                  * Reviews received
                                                                  * Leads received (with details)
                                                                  * Click analytics for this operator
                                                                  * Activity log (all changes made)
                                                                  * Notes (internal admin notes)
                                                                  * Impersonate Button (view their Command Center as them)
---


### 10.4 Leads Management
Track every lead generated through the directory
What Counts as a Lead:
                                                                  * Phone click (click-to-call)
                                                                  * Email click
                                                                  * Website click
                                                                  * Contact form submission (future)
                                                                  * Direction request (future)
Leads List View:
                                                                  * Table Columns:

                                                                     * Lead ID
                                                                     * Date/Time
                                                                     * Lead Type (Phone / Email / Website / Form)
                                                                     * Operator (link)
                                                                     * Unit (if applicable)
                                                                     * Source Page
                                                                     * User Session ID
                                                                     * Assigned To (operator)
                                                                     * Status (New / Contacted / Converted / Lost)
                                                                     * Filters:

                                                                        * Date range
                                                                        * Lead type
                                                                        * Operator
                                                                        * Status
                                                                        * Source (search results / profile / unit page)
                                                                        * Export:

                                                                           * Export to CSV/Excel
                                                                           * Date range selection
                                                                           * Filter by operator
Lead Detail View:
                                                                           * Full lead information
                                                                           * User journey (what pages they visited before converting)
                                                                           * Operator this was sent to
                                                                           * Status updates
                                                                           * Notes
Lead Analytics:
                                                                           * Leads by day/week/month
                                                                           * Leads by operator (who's getting the most)
                                                                           * Leads by type (phone vs email vs website)
                                                                           * Conversion funnel (view → click → lead)
                                                                           * Top performing units (by leads generated)
---


### 10.5 Analytics Dashboard
Overview Metrics:
                                                                           * Traffic:

                                                                              * Total page views (daily/weekly/monthly)
                                                                              * Unique visitors
                                                                              * Pages per session
                                                                              * Bounce rate
                                                                              * Top traffic sources
                                                                              * Search:

                                                                                 * Total searches performed
                                                                                 * Top search queries
                                                                                 * Searches with no results
                                                                                 * Most searched locations
                                                                                 * Most searched equipment types
                                                                                 * Engagement:

                                                                                    * Profile views by operator
                                                                                    * Unit views
                                                                                    * Click-through rates (search → profile → lead)
                                                                                    * Average time on site
                                                                                    * Conversions:

                                                                                       * Total leads generated
                                                                                       * Lead conversion rate
                                                                                       * Leads by type
                                                                                       * Top converting operators
                                                                                       * Top converting units
Reports:
                                                                                       * Operator Performance Report:

                                                                                          * Leads received
                                                                                          * Profile views
                                                                                          * Reviews
                                                                                          * Response rate
                                                                                          * Average rating
                                                                                          * Geographic Report:

                                                                                             * Leads by state/city
                                                                                             * Operators by state/city
                                                                                             * Underserved areas (searches with few results)
                                                                                             * Content Report:

                                                                                                * Most viewed blog posts
                                                                                                * FAQ engagement
                                                                                                * Page performance
Export:
                                                                                                * Export any report to CSV/Excel
                                                                                                * Schedule automated reports (weekly/monthly email)
---


### 10.6 Reviews Management
Reviews List View:
                                                                                                * Table Columns:

                                                                                                   * Review ID
                                                                                                   * Date
                                                                                                   * Operator (link)
                                                                                                   * Reviewer Name
                                                                                                   * Rating (stars)
                                                                                                   * Content (truncated)
                                                                                                   * Verified (badge)
                                                                                                   * Has Response (Yes/No)
                                                                                                   * Status (Published / Pending / Flagged / Hidden)
                                                                                                   * Actions
                                                                                                   * Filters:

                                                                                                      * Rating (1-5 stars)
                                                                                                      * Status
                                                                                                      * Has response
                                                                                                      * Date range
                                                                                                      * Operator
                                                                                                      * Moderation Actions:

                                                                                                         * Approve (publish)
                                                                                                         * Flag for review
                                                                                                         * Hide (remove from public)
                                                                                                         * Delete
                                                                                                         * Contact reviewer
Review Detail View:
                                                                                                         * Full review content
                                                                                                         * Reviewer information
                                                                                                         * Operator information
                                                                                                         * Operator response
                                                                                                         * Moderation history
                                                                                                         * Admin notes
---


### 10.7 Verifications Queue
Review and approve operator verifications
Pending Verifications:
                                                                                                         * Table Columns:
                                                                                                         * Operator Name
                                                                                                         * Verification Type (Identity / Veteran / Insurance)
                                                                                                         * Submitted Date
                                                                                                         * Documents (view links)
                                                                                                         * Status (Pending / Approved / Rejected)
                                                                                                         * Actions
Verification Detail View:
                                                                                                         * Operator information
                                                                                                         * Uploaded documents (viewable/downloadable)
                                                                                                         * Driver's license image
                                                                                                         * Selfie with license
                                                                                                         * DD-214 (for veteran badge)
                                                                                                         * Insurance certificate
                                                                                                         * Approve / Reject buttons
                                                                                                         * Rejection reason (dropdown + notes)
                                                                                                         * Send notification to operator
Verification Types:
                                                                                                         1. Identity Verification → Grants "Verified Operator" badge
                                                                                                         2. Veteran Status → Grants "Veteran Owned" badge
                                                                                                         3. Insurance Verification → Grants "Insured & Bonded" badge
---


### 10.8 Pages Management
Manage static pages on the directory
Pages List:
                                                                                                         * Homepage
                                                                                                         * About Us
                                                                                                         * How It Works
                                                                                                         * Badge Explainer
                                                                                                         * For Business Owners
                                                                                                         * Privacy Policy
                                                                                                         * Terms of Service
                                                                                                         * Contact Us
Page Editor:
                                                                                                         * Page title
                                                                                                         * URL slug
                                                                                                         * Meta title (SEO)
                                                                                                         * Meta description (SEO)
                                                                                                         * Content (rich text editor)
                                                                                                         * Featured image
                                                                                                         * Status (Published / Draft)
                                                                                                         * Last updated
---


### 10.9 Blog / Content Management
Full blog system for SEO and content marketing
Blog Posts List:
                                                                                                         * Table Columns:

                                                                                                            * Title
                                                                                                            * Author
                                                                                                            * Category
                                                                                                            * Status (Published / Draft / Scheduled)
                                                                                                            * Publish Date
                                                                                                            * Views
                                                                                                            * Actions
                                                                                                            * Filters:

                                                                                                               * Status
                                                                                                               * Category
                                                                                                               * Author
                                                                                                               * Date range
Blog Post Editor:
                                                                                                               * Title
                                                                                                               * URL slug
                                                                                                               * Featured image
                                                                                                               * Content (rich text editor with image upload)
                                                                                                               * Excerpt/Summary
                                                                                                               * Category (dropdown)
                                                                                                               * Tags (multi-select)
                                                                                                               * Author
                                                                                                               * Meta title (SEO)
                                                                                                               * Meta description (SEO)
                                                                                                               * Status (Draft / Published / Scheduled)
                                                                                                               * Publish date/time
                                                                                                               * Allow comments (toggle)
Blog Categories:
                                                                                                               * Create/edit/delete categories
                                                                                                               * Category name
                                                                                                               * Category slug
                                                                                                               * Category description
Blog Settings:
                                                                                                               * Posts per page
                                                                                                               * Default author
                                                                                                               * Comment moderation settings
                                                                                                               * Social sharing options
---


### 10.10 FAQ Management
Manage frequently asked questions
FAQ Sections:
                                                                                                               * For Renters
                                                                                                               * For Operators
                                                                                                               * About Badges
                                                                                                               * Billing & Payments
                                                                                                               * Technical Support
FAQ List:
                                                                                                               * Question
                                                                                                               * Answer
                                                                                                               * Section/Category
                                                                                                               * Display order
                                                                                                               * Status (Published / Hidden)
                                                                                                               * Views (how often viewed)
FAQ Editor:
                                                                                                               * Question (text)
                                                                                                               * Answer (rich text)
                                                                                                               * Section (dropdown)
                                                                                                               * Display order (number)
                                                                                                               * Status
                                                                                                               * Related FAQs (link to other questions)
---


### 10.11 Support Tickets
Handle customer support inquiries
Ticket Sources:
                                                                                                               * Contact form submissions
                                                                                                               * Email (support@patriothauls.com)
                                                                                                               * Operator submitted tickets
                                                                                                               * Flagged reviews
Tickets List View:
                                                                                                               * Table Columns:

                                                                                                                  * Ticket ID
                                                                                                                  * Subject
                                                                                                                  * Submitted By (name/email)
                                                                                                                  * Type (General / Operator / Technical / Billing / Report Issue)
                                                                                                                  * Priority (Low / Medium / High / Urgent)
                                                                                                                  * Status (Open / In Progress / Waiting / Resolved / Closed)
                                                                                                                  * Assigned To (admin user)
                                                                                                                  * Created Date
                                                                                                                  * Last Updated
                                                                                                                  * Actions
                                                                                                                  * Filters:

                                                                                                                     * Status
                                                                                                                     * Priority
                                                                                                                     * Type
                                                                                                                     * Assigned to
                                                                                                                     * Date range
Ticket Detail View:
                                                                                                                     * Ticket information
                                                                                                                     * Conversation thread (back and forth messages)
                                                                                                                     * Reply box
                                                                                                                     * Internal notes (not visible to customer)
                                                                                                                     * Change status
                                                                                                                     * Change priority
                                                                                                                     * Assign to team member
                                                                                                                     * Link to operator (if applicable)
                                                                                                                     * Attachments
Ticket Actions:
                                                                                                                     * Reply to customer (email sent automatically)
                                                                                                                     * Add internal note
                                                                                                                     * Change status
                                                                                                                     * Escalate
                                                                                                                     * Merge with another ticket
                                                                                                                     * Close ticket
---


### 10.12 Contact Messages
Incoming contact form submissions
Contact Messages List:
                                                                                                                     * Table Columns:
                                                                                                                     * Date
                                                                                                                     * Name
                                                                                                                     * Email
                                                                                                                     * Phone
                                                                                                                     * Subject/Type
                                                                                                                     * Message (truncated)
                                                                                                                     * Status (New / Read / Replied / Archived)
                                                                                                                     * Actions
Message Detail:
                                                                                                                     * Full message content
                                                                                                                     * Contact information
                                                                                                                     * Reply button (opens email client or inline reply)
                                                                                                                     * Convert to support ticket button
                                                                                                                     * Archive button
---


### 10.13 Users & Permissions (Admin Users)
Manage admin team access
User Roles:
                                                                                                                     * Super Admin: Full access to everything
                                                                                                                     * Admin: Full access except user management and settings
                                                                                                                     * Moderator: Reviews, support tickets, verifications only
                                                                                                                     * Content Editor: Blog, pages, FAQ only
                                                                                                                     * Viewer: Read-only access to dashboards and reports
Users List:
                                                                                                                     * Name
                                                                                                                     * Email
                                                                                                                     * Role
                                                                                                                     * Last login
                                                                                                                     * Status (Active / Inactive)
                                                                                                                     * Actions
User Editor:
                                                                                                                     * Name
                                                                                                                     * Email
                                                                                                                     * Password (reset)
                                                                                                                     * Role (dropdown)
                                                                                                                     * Status
                                                                                                                     * Permissions (granular overrides)
---


### 10.14 Settings
General Settings:
                                                                                                                     * Site name
                                                                                                                     * Site tagline
                                                                                                                     * Contact email
                                                                                                                     * Support email
                                                                                                                     * Phone number
                                                                                                                     * Address
                                                                                                                     * Social media links
SEO Settings:
                                                                                                                     * Default meta title format
                                                                                                                     * Default meta description
                                                                                                                     * Google Analytics ID
                                                                                                                     * Google Search Console verification
                                                                                                                     * Sitemap settings
Email Settings:
                                                                                                                     * From name
                                                                                                                     * From email
                                                                                                                     * Email templates (welcome, review request, verification approved, etc.)
                                                                                                                     * SMTP configuration
Notification Settings:
                                                                                                                     * New operator signup (email admins)
                                                                                                                     * New support ticket (email admins)
                                                                                                                     * New review (email admins)
                                                                                                                     * Daily summary email
Integrations:
                                                                                                                     * Google Maps API key
                                                                                                                     * Email service (SendGrid, Mailgun, etc.)
                                                                                                                     * SMS service (Twilio, etc.)
                                                                                                                     * Analytics (Google Analytics, etc.)
---


### 10.15 Activity Log
Complete audit trail of all admin actions
Activity Log View:
                                                                                                                     * Table Columns:

                                                                                                                        * Date/Time
                                                                                                                        * Admin User
                                                                                                                        * Action Type
                                                                                                                        * Description
                                                                                                                        * Target (what was affected)
                                                                                                                        * IP Address
                                                                                                                        * Filters:

                                                                                                                           * Admin user
                                                                                                                           * Action type
                                                                                                                           * Date range
                                                                                                                           * Target type (Operator / Review / Ticket / etc.)
Action Types Logged:
                                                                                                                           * Operator created/edited/deleted
                                                                                                                           * Badge assigned/removed
                                                                                                                           * Review approved/hidden/deleted
                                                                                                                           * Ticket created/updated/closed
                                                                                                                           * Settings changed
                                                                                                                           * User created/edited
                                                                                                                           * Bulk import performed
                                                                                                                           * Verification approved/rejected
---


---