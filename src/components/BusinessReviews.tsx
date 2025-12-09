import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GmbReview {
  id: string;
  author: string;
  rating: number;
  review_text: string | null;
  review_date?: string;
}

interface UserReview {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
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
      // First, fetch user reviews
      const { data: userReviewsData } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', businessId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      const validUserReviews = (userReviewsData || []) as UserReview[];
      setUserReviews(validUserReviews);

      // If we have 3+ user reviews, use those and skip GMB
      if (validUserReviews.length >= 3) {
        setSource('user');
        setLoading(false);
        return;
      }

      // Otherwise, try to fetch GMB reviews
      const { data, error } = await supabase.functions.invoke('get-gmb-reviews', {
        body: { business_id: businessId, place_id: placeId },
      });

      if (error) {
        console.error('Error fetching GMB reviews:', error);
      } else if (data?.reviews?.length > 0) {
        setGmbReviews(data.reviews as GmbReview[]);
        setSource('google');
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
      }))
    : gmbReviews.map(r => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        review_text: r.review_text,
        date: r.review_date || '',
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
          Reviews
        </CardTitle>
        {hasReviews && (
          <Badge variant={source === 'google' ? 'secondary' : 'default'}>
            {source === 'google' ? 'Seeding Reviews' : 'Customer Reviews'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasReviews ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Add your first review</p>
            <p className="text-sm text-muted-foreground mt-1">
              Reviews from customers will appear here
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
                  <span className="font-medium">
                    {review.author}
                  </span>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
