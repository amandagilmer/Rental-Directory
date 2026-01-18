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
  review_source?: 'patriot_hauls' | 'google';
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
      // First, get business import status
      const { data: bizData } = await supabase
        .from('business_listings')
        .select('gmb_import_completed')
        .eq('id', businessId)
        .single();

      const isImported = bizData?.gmb_import_completed || false;

      // Fetch user reviews
      const { data: userReviewsData } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      const validUserReviews = (userReviewsData || []) as UserReview[];
      setUserReviews(validUserReviews);

      // If we have any reviews in your_reviews, we show those
      if (validUserReviews.length > 0) {
        setSource('user');
      }

      // If NOT imported and < 5 reviews, try to fetch GMB fallback
      if (!isImported && validUserReviews.length < 5 && placeId) {
        const { data, error } = await supabase.functions.invoke('get-gmb-reviews', {
          body: { business_id: businessId, place_id: placeId },
        });

        if (error) {
          console.error('Error fetching GMB reviews:', error);
        } else if (data?.reviews?.length > 0) {
          const visibleReviews = (data.reviews as GmbReview[]).filter(r => !r.admin_hidden);
          setGmbReviews(visibleReviews);
          if (validUserReviews.length === 0 && visibleReviews.length > 0) {
            setSource('google');
          }
        }
      }

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
    <div className="space-y-6">
      {/* Primary: Customer Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
          {userReviews.length > 0 && (
            <Badge variant="default">
              {userReviews.length} Review{userReviews.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {userReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No customer reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to leave a review!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.author_name}</span>
                      {review.review_source === 'google' ? (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1 py-0 border-dashed text-muted-foreground">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          </svg>
                          Imported
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 bg-primary/10 text-primary border-none">
                          Verified Renter
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-muted-foreground text-sm">{review.review_text}</p>
                  )}
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

      {/* Secondary: Google Reviews (shown as supplement) */}
      {gmbReviews.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Reviews
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              From Google
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {gmbReviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm">{review.author}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted'
                              }`}
                          />
                        ))}
                      </div>
                      {review.review_date && (
                        <span className="text-xs text-muted-foreground">
                          {review.review_date}
                        </span>
                      )}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-muted-foreground text-xs line-clamp-2">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
