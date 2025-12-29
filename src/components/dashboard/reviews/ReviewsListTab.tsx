import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Reply, Send, Loader2, Sparkles, Tag, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AIReviewResponse } from '@/components/AIReviewResponse';

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

interface ReviewsListTabProps {
  reviews: Review[];
  listingId: string;
  businessName: string;
  isPro?: boolean;
  onReviewsUpdate: (reviews: Review[]) => void;
}

export default function ReviewsListTab({ reviews, listingId, businessName, isPro = false, onReviewsUpdate }: ReviewsListTabProps) {
  const { toast } = useToast();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Extract keywords from reviews
  const extractKeywords = () => {
    const allText = reviews
      .map(r => r.review_text || '')
      .join(' ')
      .toLowerCase();
    
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'she', 'him', 'her', 'his', 'this', 'that', 'these', 'those', 'very', 'just', 'so', 'really', 'very'];
    
    const words = allText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  };

  const keywords = extractKeywords();

  // Generate AI summary
  const generateSummary = () => {
    if (reviews.length === 0) return 'No reviews yet.';
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const reviewsWithText = reviews.filter(r => r.review_text);
    
    if (avgRating >= 4.5) {
      return `Customers love your business! With an average rating of ${avgRating.toFixed(1)} stars across ${reviews.length} reviews, you're consistently exceeding expectations. ${positiveCount} customers gave you 4+ stars.`;
    } else if (avgRating >= 3.5) {
      return `Your business is performing well with an average of ${avgRating.toFixed(1)} stars. ${positiveCount} out of ${reviews.length} customers gave positive ratings. Consider addressing any recurring concerns to improve further.`;
    } else {
      return `There's room for improvement with your ${avgRating.toFixed(1)} star average. Review customer feedback carefully to identify areas that need attention.`;
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      if (review.rating !== minRating) return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      
      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (reviewDate < sevenDaysAgo) return false;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (reviewDate < thirtyDaysAgo) return false;
      } else if (dateFilter === '90days') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (reviewDate < ninetyDaysAgo) return false;
      }
    }
    
    return true;
  });

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

      const updatedReviews = reviews.map(r => 
        r.id === reviewId 
          ? { ...r, vendor_response: responseText.trim(), vendor_response_at: new Date().toISOString() }
          : r
      );
      onReviewsUpdate(updatedReviews);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* AI Summary Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {generateSummary()}
            </p>
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Common Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-3 space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto">
                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
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
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        Needs Response
                      </Badge>
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
                      {/* AI Review Response Helper */}
                      <AIReviewResponse
                        reviewText={review.review_text || ''}
                        rating={review.rating}
                        authorName={review.author_name}
                        businessName={businessName}
                        isPro={isPro}
                        onUseResponse={(response) => setResponseText(response)}
                      />

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
                      Reply
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
