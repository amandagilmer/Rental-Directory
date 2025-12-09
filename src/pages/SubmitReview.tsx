import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeadData {
  id: string;
  name: string;
  email: string;
  business_id: string;
  business_name?: string;
}

export default function SubmitReview() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showInitials, setShowInitials] = useState(true);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setError('Invalid review link');
      setLoading(false);
      return;
    }

    try {
      // Find lead by review_token
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, name, email, business_id')
        .eq('review_token', token)
        .maybeSingle();

      if (leadError || !lead) {
        setError('This review link is invalid or has expired');
        setLoading(false);
        return;
      }

      // Check if review already submitted for this lead
      const { data: existingReview } = await supabase
        .from('your_reviews')
        .select('id')
        .eq('lead_id', lead.id)
        .maybeSingle();

      if (existingReview) {
        setError('You have already submitted a review');
        setLoading(false);
        return;
      }

      // Get business name
      const { data: business } = await supabase
        .from('business_listings')
        .select('business_name')
        .eq('id', lead.business_id)
        .maybeSingle();

      setLeadData({
        ...lead,
        business_name: business?.business_name || 'this business',
      });
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!leadData || rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get initials from name
      const nameParts = leadData.name.split(' ');
      const initials = nameParts.map(p => p[0]).join('').toUpperCase();
      const displayName = showInitials ? `${nameParts[0]} ${initials.slice(1)}.` : nameParts[0];

      const { error: insertError } = await supabase
        .from('your_reviews')
        .insert({
          business_id: leadData.business_id,
          lead_id: leadData.id,
          author_name: displayName,
          author_email: leadData.email,
          rating,
          review_text: reviewText.trim() || null,
          show_initials: showInitials,
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Review</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => navigate('/')}
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Your review has been submitted successfully.
            </p>
            <Button 
              className="mt-6"
              onClick={() => navigate('/')}
            >
              Browse More Businesses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
          <CardDescription>
            Share your experience with <strong>{leadData?.business_name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">How would you rate this business?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted stroke-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Review <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="Tell others about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {reviewText.length}/500
            </p>
          </div>

          {/* Privacy Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInitials"
              checked={showInitials}
              onCheckedChange={(checked) => setShowInitials(checked as boolean)}
            />
            <label
              htmlFor="showInitials"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Show my initials with the review (e.g., "John D.")
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
