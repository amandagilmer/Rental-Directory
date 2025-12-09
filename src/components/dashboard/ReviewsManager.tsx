import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Reply, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

interface ReviewsManagerProps {
  listingId: string;
}

export default function ReviewsManager({ listingId }: ReviewsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchReviews();
    }
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('your_reviews')
        .select('*')
        .eq('business_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast({
        title: 'Response required',
        description: 'Please enter a response',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('your_reviews')
        .update({
          vendor_response: responseText.trim(),
          vendor_response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, vendor_response: responseText.trim(), vendor_response_at: new Date().toISOString() }
          : r
      ));

      setRespondingTo(null);
      setResponseText('');
      toast({
        title: 'Response submitted',
        description: 'Your response is now visible on your profile',
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit response',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Reviews
            </CardTitle>
            <CardDescription>
              Manage and respond to customer reviews
            </CardDescription>
          </div>
          {averageRating && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold">{averageRating}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Reviews from customers will appear here after they submit them
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-medium">{review.author_name}</span>
                    <div className="flex items-center gap-2 mt-1">
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
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  {!review.vendor_response && (
                    <Badge variant="outline">Needs Response</Badge>
                  )}
                </div>

                {review.review_text && (
                  <p className="text-muted-foreground mb-4">{review.review_text}</p>
                )}

                {review.vendor_response && (
                  <div className="bg-muted/50 rounded-md p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Your Response</span>
                      {review.vendor_response_at && (
                        <span className="text-xs text-muted-foreground">
                          • {format(new Date(review.vendor_response_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{review.vendor_response}</p>
                  </div>
                )}

                {!review.vendor_response && respondingTo === review.id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {responseText.length}/500
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitResponse(review.id)}
                          disabled={submitting || !responseText.trim()}
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Submit
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !review.vendor_response ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Respond
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
