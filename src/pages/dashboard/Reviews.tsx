import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Info, Globe } from 'lucide-react';
import GoogleBusinessConnect from '@/components/dashboard/reviews/GoogleBusinessConnect';
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
  const { toast } = useToast();
  const [listing, setListing] = useState<{
    id: string;
    business_name: string;
    place_id?: string | null;
    gmb_import_completed?: boolean;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

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
        .select('id, business_name, place_id, gmb_import_completed')
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

  const handleImport = async () => {
    if (!listing?.id || !listing?.place_id) return;

    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
        body: { business_id: listing.id, place_id: listing.place_id },
      });

      if (error) throw error;

      toast({
        title: 'Import Successful',
        description: data.message || 'Your Google reviews have been imported.',
      });

      fetchListingAndReviews();
    } catch (error: any) {
      console.error('Error importing reviews:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import reviews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
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
      <Card className="border-2 border-dashed">
        <CardContent className="py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No Listing Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              We couldn't find a business listing for this account. If you just signed in with Google and your data is gone, you might be in the wrong session.
            </p>
          </div>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button asChild className="font-bold">
              <Link to="/dashboard/business-info">Create New Listing</Link>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="text-xs text-muted-foreground"
            >
              Signed into the wrong account? Sign Out & Start Over
            </Button>
          </div>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Google Sync
          </TabsTrigger>
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

        <TabsContent value="sync">
          <GoogleBusinessConnect
            listingId={listing.id}
            businessName={listing.business_name}
            onSuccess={fetchListingAndReviews}
          />
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
