import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessListing {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  website?: string;
}

interface RawListing {
  id: string;
  business_name: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  image_url: string | null;
  email?: string | null;
  website?: string | null;
}

interface Review {
  rating: number;
}

// Map category names to category IDs for filtering
const categoryIdMap: Record<string, string> = {
  'Car Rental': 'car-rental',
  'Equipment Rental': 'equipment-rental',
  'Event Rental': 'event-rental',
  'Storage Rental': 'storage-rental',
  'Bike Rental': 'bike-rental',
  'Party Rental': 'party-rental',
  'Trailer Rental': 'trailer-rental',
  'Tool Rental': 'tool-rental',
};

export function useBusinessListings() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch published business listings
        const { data: listings, error: listingsError } = await supabase
          .from('business_listings')
          .select('id, business_name, category, description, address, phone, image_url, email, website')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        if (!listings || listings.length === 0) {
          setBusinesses([]);
          setLoading(false);
          return;
        }

        // Fetch reviews for all listings to calculate ratings
        const listingIds = listings.map(l => l.id);
        const { data: reviews } = await supabase
          .from('your_reviews')
          .select('business_id, rating')
          .in('business_id', listingIds);

        // Calculate average ratings per listing
        const ratingsMap = new Map<string, number[]>();
        reviews?.forEach((review: Review & { business_id: string }) => {
          const existing = ratingsMap.get(review.business_id) || [];
          existing.push(review.rating);
          ratingsMap.set(review.business_id, existing);
        });

        // Fetch primary photos for listings
        const { data: photos } = await supabase
          .from('business_photos')
          .select('listing_id, storage_path')
          .in('listing_id', listingIds)
          .eq('is_primary', true);

        const photosMap = new Map<string, string>();
        photos?.forEach(photo => {
          const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
          photosMap.set(photo.listing_id, data.publicUrl);
        });

        // Transform listings to the expected format
        const transformedListings: BusinessListing[] = listings.map((listing: RawListing) => {
          const ratings = ratingsMap.get(listing.id) || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
            : 4.5; // Default rating

          const categoryId = categoryIdMap[listing.category] || listing.category.toLowerCase().replace(/\s+/g, '-');
          
          // Generate slug from business name
          const slug = listing.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          return {
            id: listing.id,
            slug,
            name: listing.business_name,
            category: listing.category,
            categoryId,
            description: listing.description || 'Quality rental services for your needs.',
            address: listing.address || 'Contact for location',
            phone: listing.phone || 'Contact for details',
            rating: parseFloat(avgRating.toFixed(1)),
            image: photosMap.get(listing.id) || listing.image_url || '/placeholder.svg',
            email: listing.email || undefined,
            website: listing.website || undefined,
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
