
-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact form
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

-- Admins can view all submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions FOR SELECT
USING (is_admin());

-- Admins can update submissions
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions FOR UPDATE
USING (is_admin());

-- Admins can delete submissions
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions FOR DELETE
USING (is_admin());

-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Anyone can view published FAQs
CREATE POLICY "Anyone can view published FAQs"
ON public.faqs FOR SELECT
USING (is_published = true);

-- Admins can do everything with FAQs
CREATE POLICY "Admins can manage FAQs"
ON public.faqs FOR ALL
USING (is_admin());

-- Create pages table for static content
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view pages
CREATE POLICY "Anyone can view pages"
ON public.pages FOR SELECT
USING (true);

-- Admins can manage pages
CREATE POLICY "Admins can manage pages"
ON public.pages FOR ALL
USING (is_admin());

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

-- Admins can view all posts
CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts FOR SELECT
USING (is_admin());

-- Admins can manage posts
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (is_admin());

-- Insert default pages
INSERT INTO public.pages (slug, title, content, meta_title, meta_description) VALUES
('about', 'About Us', '## Our Mission

We are dedicated to connecting customers with the best local rental businesses in their area. Our platform makes it easy to discover, compare, and contact rental providers for all your needs.

## Our Story

Founded with a vision to simplify the rental discovery process, our directory has grown to become a trusted resource for both customers seeking rental services and businesses looking to expand their reach.

## Why Choose Us

### Verified Businesses
Every listing on our platform is verified to ensure you connect with legitimate, quality rental providers.

### Easy Discovery
Our powerful search and filtering tools help you find exactly what you need, when you need it.

### Local Focus
We specialize in connecting you with businesses in your local community, supporting local economies.

### Trusted Reviews
Real customer reviews help you make informed decisions about which rental business to choose.

## Our Values

- **Transparency**: We believe in honest, clear information
- **Quality**: We maintain high standards for listed businesses
- **Community**: We support local businesses and communities
- **Innovation**: We continuously improve our platform', 'About Us - Local Rental Directory', 'Learn about our mission to connect customers with trusted local rental businesses.'),
('privacy', 'Privacy Policy', '## Privacy Policy

**Last Updated: December 2024**

### Table of Contents
1. [Information We Collect](#information-we-collect)
2. [How We Use Your Information](#how-we-use-information)
3. [Information Sharing](#information-sharing)
4. [Data Security](#data-security)
5. [Your Rights](#your-rights)
6. [Contact Us](#contact-us)

---

### 1. Information We Collect {#information-we-collect}

We collect information you provide directly, including:
- Name and contact information
- Business details for listings
- Communications with us

We also collect certain information automatically:
- Device and browser information
- Usage data and analytics
- Location data (with permission)

### 2. How We Use Your Information {#how-we-use-information}

We use collected information to:
- Provide and improve our services
- Process transactions and send notifications
- Respond to inquiries and support requests
- Send marketing communications (with consent)
- Ensure platform security and prevent fraud

### 3. Information Sharing {#information-sharing}

We may share information with:
- Service providers who assist our operations
- Business partners for directory listings
- Legal authorities when required by law

We do not sell your personal information to third parties.

### 4. Data Security {#data-security}

We implement appropriate security measures to protect your information, including:
- Encryption of sensitive data
- Regular security assessments
- Access controls and authentication

### 5. Your Rights {#your-rights}

You have the right to:
- Access your personal information
- Request correction of inaccurate data
- Request deletion of your data
- Opt-out of marketing communications

### 6. Contact Us {#contact-us}

For privacy-related inquiries, contact us at:
- Email: privacy@localrentaldirectory.com
- Address: [Your Business Address]', 'Privacy Policy - Local Rental Directory', 'Our privacy policy explains how we collect, use, and protect your personal information.'),
('terms', 'Terms of Service', '## Terms of Service

**Last Updated: December 2024**

### Table of Contents
1. [Acceptance of Terms](#acceptance)
2. [Use of Services](#use-of-services)
3. [User Accounts](#user-accounts)
4. [Business Listings](#business-listings)
5. [Prohibited Conduct](#prohibited-conduct)
6. [Intellectual Property](#intellectual-property)
7. [Limitation of Liability](#limitation)
8. [Termination](#termination)
9. [Contact Information](#contact)

---

### 1. Acceptance of Terms {#acceptance}

By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

### 2. Use of Services {#use-of-services}

Our platform provides a directory of local rental businesses. You may use our services to:
- Search and discover rental businesses
- Contact businesses for quotes and information
- List your business (for verified business owners)
- Leave reviews for businesses you have used

### 3. User Accounts {#user-accounts}

To access certain features, you must create an account. You are responsible for:
- Maintaining the confidentiality of your account
- All activities that occur under your account
- Providing accurate and complete information

### 4. Business Listings {#business-listings}

Business owners who list on our platform must:
- Provide accurate business information
- Maintain current contact details
- Respond to customer inquiries professionally
- Comply with all applicable laws and regulations

### 5. Prohibited Conduct {#prohibited-conduct}

You agree not to:
- Submit false or misleading information
- Harass or harm other users
- Attempt to gain unauthorized access
- Use the platform for illegal purposes
- Spam or send unsolicited communications

### 6. Intellectual Property {#intellectual-property}

All content on our platform, including logos, text, and design, is protected by intellectual property laws. You may not reproduce or distribute our content without permission.

### 7. Limitation of Liability {#limitation}

We are not liable for:
- Actions of third-party businesses listed on our platform
- Loss of data or service interruptions
- Indirect or consequential damages

### 8. Termination {#termination}

We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.

### 9. Contact Information {#contact}

For questions about these terms, contact us at:
- Email: legal@localrentaldirectory.com
- Address: [Your Business Address]', 'Terms of Service - Local Rental Directory', 'Read our terms of service to understand the rules and guidelines for using our platform.');

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, category, display_order) VALUES
('What is Local Rental Directory?', 'Local Rental Directory is a platform that connects customers with local rental businesses including trailer rentals, RV rentals, camper rentals, equipment rentals, and more. We make it easy to discover, compare, and contact rental providers in your area.', 'General', 1),
('How do I find a rental business near me?', 'Simply enter your location or zip code on our homepage, select a category if desired, and browse the results. You can also use the map view to see businesses in your area visually.', 'General', 2),
('Is it free to use the directory?', 'Yes! Searching and contacting businesses through our directory is completely free for customers. Business owners can list their business with our various subscription plans.', 'General', 3),
('How do I contact a business?', 'Each business listing includes contact information such as phone number, email, and website. You can also use our "Request Quote" button to send an inquiry directly through our platform.', 'For Customers', 4),
('How do I list my business?', 'Click on "List Your Business" or "Business Login" to create an account. Once registered, you can set up your business profile with photos, services, hours, and more.', 'For Businesses', 5),
('What are the subscription plans?', 'We offer Free, Pro, Premium, and Enterprise plans to suit businesses of all sizes. Visit our Pricing page to compare features and choose the best plan for your needs.', 'For Businesses', 6),
('Can I edit my business listing?', 'Yes! Log into your dashboard to update your business information, photos, services, hours, and more at any time.', 'For Businesses', 7),
('How do reviews work?', 'Customers who have used your services can leave reviews. You can also request reviews from satisfied customers through your dashboard. All reviews are verified to ensure authenticity.', 'For Businesses', 8);
