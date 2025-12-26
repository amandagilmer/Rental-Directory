import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
}

export default function ReviewLanding() {
  const { businessId } = useParams<{ businessId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showInitials, setShowInitials] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) {
        setError('Invalid review link');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('business_listings')
        .select('id, business_name')
        .eq('id', businessId)
        .maybeSingle();

      if (fetchError || !data) {
        setError('Business not found');
        setLoading(false);
        return;
      }

      setBusiness(data);
      setLoading(false);
    };

    fetchBusiness();
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Calculate display name
      const nameParts = name.trim().split(' ');
      const initials = nameParts.map(p => p[0]).join('').toUpperCase();
      const displayName = showInitials && nameParts.length > 1 
        ? `${nameParts[0]} ${initials.slice(1)}.` 
        : nameParts[0];

      const { error: insertError } = await supabase
        .from('your_reviews')
        .insert({
          business_id: business!.id,
          author_name: displayName,
          author_email: email.trim() || null,
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Unable to Load</CardTitle>
              <CardDescription>{error || 'Business not found'}</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                Your review for {business.business_name} has been submitted successfully.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Leave a Review
            </h1>
            <p className="text-muted-foreground">
              for <span className="font-medium text-foreground">{business.business_name}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How was your experience?</CardTitle>
              <CardDescription>
                Your feedback helps other customers make informed decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>

                {/* Email (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    We won't share your email publicly
                  </p>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <Label htmlFor="review">Your Review (optional)</Label>
                  <Textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                  />
                </div>

                {/* Show Initials */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="initials"
                    checked={showInitials}
                    onCheckedChange={(checked) => setShowInitials(checked === true)}
                  />
                  <Label htmlFor="initials" className="text-sm font-normal cursor-pointer">
                    Show only my first name and initials (e.g., "John S.")
                  </Label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}