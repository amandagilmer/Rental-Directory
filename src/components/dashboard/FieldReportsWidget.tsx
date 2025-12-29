import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ChevronRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  vendor_response: string | null;
}

export default function FieldReportsWidget() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      const { data: listing } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!listing) {
        setLoading(false);
        return;
      }

      const { data, error, count } = await supabase
        .from('your_reviews')
        .select('*', { count: 'exact' })
        .eq('business_id', listing.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setReviews(data);
        setTotalReviews(count || 0);
        
        if (count && count > 0) {
          // Calculate average rating
          const { data: allReviews } = await supabase
            .from('your_reviews')
            .select('rating')
            .eq('business_id', listing.id);
          
          if (allReviews && allReviews.length > 0) {
            const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            setAverageRating(Math.round(avg * 10) / 10);
          }
        }
      }
      setLoading(false);
    };

    fetchReviews();
  }, [user]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3.5 h-3.5",
              star <= rating ? "fill-amber-500 text-amber-500" : "text-muted"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Field Reports
          </h3>
          {averageRating !== null && (
            <div className="flex items-center gap-2 mt-1">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm font-semibold text-foreground">{averageRating}</span>
              <span className="text-xs text-muted-foreground">({totalReviews} reports)</span>
            </div>
          )}
        </div>
        <Link 
          to="/dashboard/reviews"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse p-3 bg-muted/30 rounded-lg">
              <div className="h-3 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No field reports yet</p>
          <Link to="/dashboard/reviews" className="text-xs text-primary hover:underline mt-1 inline-block">
            Request your first review
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {review.author_name}
              </p>
              {review.review_text && (
                <p className="text-sm text-foreground line-clamp-2">
                  "{review.review_text}"
                </p>
              )}
              {review.vendor_response && (
                <div className="mt-2 pt-2 border-t border-border flex items-start gap-2">
                  <MessageSquare className="w-3 h-3 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {review.vendor_response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
