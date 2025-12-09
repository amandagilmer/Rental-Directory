import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  leadId?: string;
  authorName: string;
  authorEmail?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  leadId,
  authorName,
  authorEmail,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('your_reviews').insert({
        business_id: businessId,
        lead_id: leadId,
        author_name: authorName,
        author_email: authorEmail,
        rating,
        review_text: reviewText.trim() || null,
      });

      if (error) throw error;

      toast.success('Thank you for your review!');
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How was your experience?</DialogTitle>
          <DialogDescription>
            Share your experience with {businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
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
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review-text">Your Review (optional)</Label>
            <Textarea
              id="review-text"
              placeholder="Tell others about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
