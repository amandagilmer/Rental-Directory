import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import ReviewsOverviewTab from '@/components/dashboard/reviews/ReviewsOverviewTab';
import ReviewsListTab from '@/components/dashboard/reviews/ReviewsListTab';
import ReviewsWidgetsTab from '@/components/dashboard/reviews/ReviewsWidgetsTab';
import ReviewsRequestsTab from '@/components/dashboard/reviews/ReviewsRequestsTab';
import ReviewSettingsTab from '@/components/dashboard/reviews/ReviewSettingsTab';
interface Review {
  id: string;
  author_name: string;
  author_email: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
  vendor_response: string | null;
  vendor_response_at: string | null;
  show_initials: boolean;
}

export default function Reviews() {
  const { user } = useAuth();
  const [listing, setListing] = useState<{ id: string; business_name: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListingAndReviews();
    }
  }, [user]);

  const fetchListingAndReviews = async () => {
    try {
      // First get the user's listing
      const { data: listingData, error: listingError } = await supabase
        .from('business_listings')
        .select('id, business_name')
        .eq('user_id', user?.id)
        .single();

      if (listingError || !listingData) {
        setLoading(false);
        return;
      }

      setListing(listingData);

      // Then fetch reviews for this listing
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', listingData.id)
        .order('created_at', { ascending: false });

      if (!reviewsError) {
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Listing Found</h3>
          <p className="text-muted-foreground">
            Create a business listing first to manage reviews.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Manage customer reviews for {listing.business_name}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReviewsOverviewTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsListTab 
            reviews={reviews} 
            listingId={listing.id}
            businessName={listing.business_name}
            isPro={true}
            onReviewsUpdate={updateReviews}
          />
        </TabsContent>

        <TabsContent value="widgets">
          <ReviewsWidgetsTab listingId={listing.id} businessName={listing.business_name} />
        </TabsContent>

        <TabsContent value="requests">
          <ReviewsRequestsTab listingId={listing.id} />
        </TabsContent>

        <TabsContent value="settings">
          <ReviewSettingsTab listingId={listing.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
