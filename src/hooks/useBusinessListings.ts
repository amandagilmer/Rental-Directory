import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessService {
  id: string;
  serviceName: string;
  subCategory: string | null;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  isAvailable: boolean;
}

export interface BusinessListing {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  additionalCategories: string[];
  allCategoryIds: string[];
  description: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone: string;
  rating: number;
  reviewCount: number;
  image: string;
  latitude?: number;
  longitude?: number;
  show_exact_location?: boolean;
  email?: string;
  website?: string;
  badges: string[];
  services: BusinessService[];
  lowestDailyRate: number | null;
  hasAvailableUnits: boolean;
}

interface RawListing {
  id: string;
  business_name: string;
  category: string;
  additional_categories: string[] | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  image_url: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  show_exact_location: boolean | null;
  slug: string | null;
}

interface Review {
  rating: number;
}

// Helper to generate slug from category name
const generateCategorySlug = (name: string | null | undefined): string => {
  if (!name) return 'uncategorized';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export function useBusinessListings() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch published and approved business listings
        const { data: listings, error: listingsError } = await supabase
          .from('business_listings')
          .select('id, business_name, slug, category, additional_categories, description, address, city, state, zip_code, phone, image_url, email, website, latitude, longitude, show_exact_location')
          .eq('is_published', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        if (!listings || listings.length === 0) {
          setBusinesses([]);
          setLoading(false);
          return;
        }

        const listingIds = listings.map(l => l.id);
        console.log('Fetching related data for listings:', listingIds);

        // Fetch all related data in parallel with error handling for each
        const [reviewsResult, photosResult, badgesResult, servicesResult] = await Promise.all([
          supabase
            .from('your_reviews')
            .select('business_id, rating')
            .in('business_id', listingIds)
            .then(res => ({ data: res.data || [], error: res.error })),
          supabase
            .from('business_photos')
            .select('listing_id, storage_path')
            .in('listing_id', listingIds)
            .eq('is_primary', true)
            .then(res => ({ data: res.data || [], error: res.error })),
          supabase
            .from('operator_badges')
            .select('listing_id, badge_key')
            .in('listing_id', listingIds)
            .eq('is_active', true)
            .then(res => ({ data: res.data || [], error: res.error })),
          supabase
            .from('business_services')
            .select('id, listing_id, service_name, sub_category, daily_rate, weekly_rate, monthly_rate, is_available')
            .in('listing_id', listingIds)
            .then(res => ({ data: res.data || [], error: res.error }))
        ]);

        if (reviewsResult.error) console.error('Error fetching reviews:', reviewsResult.error);
        if (photosResult.error) console.error('Error fetching photos:', photosResult.error);
        if (badgesResult.error) console.error('Error fetching badges:', badgesResult.error);
        if (servicesResult.error) console.error('Error fetching services:', servicesResult.error);

        const reviews = reviewsResult.data;
        const photos = photosResult.data;
        const badges = badgesResult.data;
        const services = servicesResult.data;

        // Build maps for efficient lookups
        const ratingsMap = new Map<string, number[]>();
        reviews.forEach((review: Review & { business_id: string }) => {
          const existing = ratingsMap.get(review.business_id) || [];
          existing.push(review.rating);
          ratingsMap.set(review.business_id, existing);
        });

        const photosMap = new Map<string, string>();
        photos.forEach(photo => {
          const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
          photosMap.set(photo.listing_id, data.publicUrl);
        });

        const badgesMap = new Map<string, string[]>();
        badges.forEach(badge => {
          const existing = badgesMap.get(badge.listing_id) || [];
          existing.push(badge.badge_key);
          badgesMap.set(badge.listing_id, existing);
        });

        const servicesMap = new Map<string, BusinessService[]>();
        services.forEach(service => {
          const existing = servicesMap.get(service.listing_id) || [];
          existing.push({
            id: service.id,
            serviceName: service.service_name,
            subCategory: service.sub_category,
            dailyRate: service.daily_rate,
            weeklyRate: service.weekly_rate,
            monthlyRate: service.monthly_rate,
            isAvailable: service.is_available ?? true,
          });
          servicesMap.set(service.listing_id, existing);
        });

        // Transform listings to the expected format
        const transformedListings: BusinessListing[] = listings.map((listing: RawListing) => {
          const ratings = ratingsMap.get(listing.id) || [];
          const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

          const categoryId = generateCategorySlug(listing.category);
          const slug = listing.slug || (listing.business_name ? listing.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'listing-' + listing.id);

          // Handle additional categories
          const additionalCategories = listing.additional_categories || [];
          const additionalCategoryIds = additionalCategories.map(cat => generateCategorySlug(cat));
          const allCategoryIds = [categoryId, ...additionalCategoryIds];

          const listingServices = servicesMap.get(listing.id) || [];
          const dailyRates = listingServices
            .map(s => s.dailyRate)
            .filter((r): r is number => r !== null && r > 0);
          const lowestDailyRate = dailyRates.length > 0 ? Math.min(...dailyRates) : null;
          const hasAvailableUnits = listingServices.some(s => s.isAvailable);

          return {
            id: listing.id,
            slug,
            name: listing.business_name,
            category: listing.category,
            categoryId,
            additionalCategories,
            allCategoryIds,
            description: listing.description || 'Quality rental services for your needs.',
            address: listing.address || 'Contact for location',
            city: listing.city || undefined,
            state: listing.state || undefined,
            zipCode: listing.zip_code || undefined,
            phone: listing.phone || 'Contact for details',
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: ratings.length,
            image: photosMap.get(listing.id) || listing.image_url || '/placeholder.svg',
            email: listing.email || undefined,
            website: listing.website || undefined,
            latitude: listing.latitude ?? undefined,
            longitude: listing.longitude ?? undefined,
            show_exact_location: listing.show_exact_location ?? true,
            badges: badgesMap.get(listing.id) || [],
            services: listingServices,
            lowestDailyRate,
            hasAvailableUnits,
          };
        });

        setBusinesses(transformedListings);
      } catch (err) {
        console.error('Error fetching business listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return { businesses, loading, error };
}