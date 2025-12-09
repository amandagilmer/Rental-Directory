import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GmbReview {
  id: string;
  author: string;
  rating: number;
  review_text: string | null;
  review_date?: string;
  admin_hidden?: boolean;
}

interface UserReview {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  show_initials?: boolean;
  vendor_response?: string | null;
  vendor_response_at?: string | null;
}

interface BusinessReviewsProps {
  businessId: string;
  placeId?: string | null;
}

type DisplayReview = {
  id: string;
  author: string;
  rating: number;
  review_text: string | null;
  date: string;
  vendor_response?: string | null;
  vendor_response_at?: string | null;
  isUserReview: boolean;
};

export default function BusinessReviews({ businessId, placeId }: BusinessReviewsProps) {
  const [gmbReviews, setGmbReviews] = useState<GmbReview[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'google' | 'user' | 'none'>('none');

  useEffect(() => {
    fetchReviews();
  }, [businessId, placeId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch user reviews (no expiration - show all)
      const { data: userReviewsData } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);

      const validUserReviews = (userReviewsData || []) as UserReview[];
      setUserReviews(validUserReviews);

      // If we have 5+ user reviews, use those and skip GMB
      if (validUserReviews.length >= 5) {
        setSource('user');
        setLoading(false);
        return;
      }

      // If we have any user reviews, show them (but also check GMB as fallback)
      if (validUserReviews.length > 0) {
        setSource('user');
      }

      // Try to fetch GMB reviews only if < 5 user reviews
      if (validUserReviews.length < 5 && placeId) {
        const { data, error } = await supabase.functions.invoke('get-gmb-reviews', {
          body: { business_id: businessId, place_id: placeId },
        });

        if (error) {
          console.error('Error fetching GMB reviews:', error);
        } else if (data?.reviews?.length > 0) {
          // Filter out admin-hidden reviews
          const visibleReviews = (data.reviews as GmbReview[]).filter(r => !r.admin_hidden);
          setGmbReviews(visibleReviews);
          // Only show GMB if no user reviews exist
          if (validUserReviews.length === 0 && visibleReviews.length > 0) {
            setSource('google');
          }
        }
      }

      // Set source to none if no reviews at all
      if (validUserReviews.length === 0 && gmbReviews.length === 0) {
        setSource('none');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize reviews into a common display format
  const displayReviews: DisplayReview[] = source === 'user' 
    ? userReviews.map(r => ({
        id: r.id,
        author: r.author_name,
        rating: r.rating,
        review_text: r.review_text,
        date: new Date(r.created_at).toLocaleDateString(),
        vendor_response: r.vendor_response,
        vendor_response_at: r.vendor_response_at,
        isUserReview: true,
      }))
    : gmbReviews.map(r => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        review_text: r.review_text,
        date: r.review_date || '',
        isUserReview: false,
      }));

  const hasReviews = displayReviews.length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse text-muted-foreground text-center">
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {source === 'user' ? 'Customer Reviews' : 'Reviews'}
        </CardTitle>
        {hasReviews && (
          <Badge variant={source === 'google' ? 'secondary' : 'default'}>
            {source === 'google' ? 'Seeding Reviews' : `${userReviews.length} Review${userReviews.length !== 1 ? 's' : ''}`}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasReviews ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to leave a review!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-border last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.author}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {review.date && (
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    )}
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-muted-foreground text-sm">{review.review_text}</p>
                )}
                {/* Vendor Response */}
                {review.vendor_response && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-muted/30 rounded-r-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Reply className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">Business Response</span>
                      {review.vendor_response_at && (
                        <span className="text-xs text-muted-foreground">
                          • {new Date(review.vendor_response_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{review.vendor_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
