import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  show_initials: boolean;
}

export default function ReviewWidget() {
  const { businessId } = useParams<{ businessId: string }>();
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);

  // Get widget configuration from URL params
  const layout = searchParams.get('layout') || 'list';
  const maxReviews = parseInt(searchParams.get('max') || '5');
  const minRating = parseInt(searchParams.get('minRating') || '1');
  const primaryColor = decodeURIComponent(searchParams.get('primary') || '#3b82f6');
  const backgroundColor = decodeURIComponent(searchParams.get('bg') || '#ffffff');
  const textColor = decodeURIComponent(searchParams.get('text') || '#1f2937');

  useEffect(() => {
    if (businessId) {
      fetchReviews();
    }
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      // Fetch business info
      const { data: businessData } = await supabase
        .from('business_listings')
        .select('business_name')
        .eq('id', businessId)
        .single();

      if (businessData) {
        setBusinessName(businessData.business_name);
      }

      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', businessId)
        .gte('rating', minRating)
        .order('created_at', { ascending: false })
        .limit(maxReviews);

      if (!error && reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (review: Review) => {
    if (review.show_initials) {
      const parts = review.author_name.split(' ');
      if (parts.length > 1) {
        return `${parts[0]} ${parts[1][0]}.`;
      }
      return review.author_name;
    }
    return review.author_name;
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.id}
          className="p-4 rounded-lg border"
          style={{ borderColor: primaryColor + '30' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: textColor }}>
              {getDisplayName(review)}
            </span>
            {renderStars(review.rating)}
          </div>
          {review.review_text && (
            <p className="text-sm mb-2" style={{ color: textColor + 'cc' }}>
              {review.review_text}
            </p>
          )}
          <p className="text-xs" style={{ color: textColor + '80' }}>
            {format(new Date(review.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      ))}
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid grid-cols-2 gap-4">
      {reviews.map((review) => (
        <div 
          key={review.id}
          className="p-4 rounded-lg border"
          style={{ borderColor: primaryColor + '30' }}
        >
          {renderStars(review.rating)}
          {review.review_text && (
            <p className="text-sm my-2 line-clamp-3" style={{ color: textColor + 'cc' }}>
              {review.review_text}
            </p>
          )}
          <p className="text-xs font-medium" style={{ color: textColor }}>
            - {getDisplayName(review)}
          </p>
        </div>
      ))}
    </div>
  );

  const renderCarouselLayout = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (reviews.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
      }
    }, [reviews.length]);

    if (reviews.length === 0) return null;
    const review = reviews[currentIndex];

    return (
      <div className="text-center p-6">
        <div className="flex justify-center mb-4">
          {renderStars(review.rating)}
        </div>
        {review.review_text && (
          <p className="text-lg mb-4" style={{ color: textColor }}>
            "{review.review_text}"
          </p>
        )}
        <p className="font-medium" style={{ color: textColor }}>
          - {getDisplayName(review)}
        </p>
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ 
                backgroundColor: i === currentIndex ? primaryColor : primaryColor + '40'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 
          className="text-xl font-semibold mb-6"
          style={{ color: textColor }}
        >
          Customer Reviews
          {businessName && <span className="font-normal text-base ml-2" style={{ color: textColor + '80' }}>for {businessName}</span>}
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12" style={{ color: textColor + '80' }}>
            No reviews yet
          </div>
        ) : (
          <>
            {layout === 'grid' || layout === 'masonry' ? renderGridLayout() : null}
            {layout === 'carousel' || layout === 'slider' ? renderCarouselLayout() : null}
            {layout === 'list' ? renderListLayout() : null}
          </>
        )}

        <div className="mt-6 text-center">
          <a
            href={`${window.location.origin}/business/${businessId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            View All Reviews
          </a>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: textColor + '60' }}>
          Powered by Local Rental Directory
        </p>
      </div>
    </div>
  );
}
