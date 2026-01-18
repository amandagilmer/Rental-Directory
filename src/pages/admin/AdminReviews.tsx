import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Search, EyeOff, Eye, Loader2, Building2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GmbReview {
  id: string;
  author: string;
  rating: number;
  review_text: string | null;
  review_date: string | null;
  business_id: string;
  admin_hidden: boolean;
  fetched_at: string;
  business_name?: string;
}

interface UserReview {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  business_id: string;
  vendor_response: string | null;
  business_name?: string;
}

export default function AdminReviews() {
  const [gmbReviews, setGmbReviews] = useState<GmbReview[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hidingReview, setHidingReview] = useState<string | null>(null);
  const [importingBusiness, setImportingBusiness] = useState<string | null>(null);
  const [eligibleBusinesses, setEligibleBusinesses] = useState<any[]>([]);

  useEffect(() => {
    fetchReviews();
    fetchEligibleBusinesses();
  }, []);

  const fetchEligibleBusinesses = async () => {
    const { data, error } = await supabase
      .from('business_listings')
      .select('id, business_name, place_id, gmb_import_completed')
      .not('place_id', 'is', null)
      .eq('gmb_import_completed', false);

    if (!error && data) {
      setEligibleBusinesses(data);
    }
  };

  const fetchReviews = async () => {
    try {
      // Fetch GMB reviews
      const { data: gmbData, error: gmbError } = await supabase
        .from('gmb_reviews')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (gmbError) throw gmbError;

      // Fetch user reviews
      const { data: userReviewData, error: userError } = await supabase
        .from('your_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Get business names for all reviews
      const businessIds = [
        ...new Set([
          ...(gmbData || []).map(r => r.business_id),
          ...(userReviewData || []).map(r => r.business_id)
        ])
      ];

      const { data: businesses } = await supabase
        .from('business_listings')
        .select('id, business_name')
        .in('id', businessIds);

      const businessMap = new Map(
        (businesses || []).map(b => [b.id, b.business_name])
      );

      setGmbReviews(
        (gmbData || []).map(r => ({
          ...r,
          business_name: businessMap.get(r.business_id) || 'Unknown Business'
        }))
      );

      setUserReviews(
        (userReviewData || []).map(r => ({
          ...r,
          business_name: businessMap.get(r.business_id) || 'Unknown Business'
        }))
      );
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (businessId: string, placeId: string) => {
    setImportingBusiness(businessId);
    try {
      const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
        body: { business_id: businessId, place_id: placeId },
      });

      if (error) throw error;

      toast.success(data.message || 'Reviews imported successfully');
      fetchReviews();
      fetchEligibleBusinesses();
    } catch (error: any) {
      console.error('Error importing reviews:', error);
      toast.error(error.message || 'Failed to import reviews');
    } finally {
      setImportingBusiness(null);
    }
  };
  const toggleGmbReviewVisibility = async (reviewId: string, currentHidden: boolean) => {
    setHidingReview(reviewId);
    try {
      const { error } = await supabase
        .from('gmb_reviews')
        .update({ admin_hidden: !currentHidden })
        .eq('id', reviewId);

      if (error) throw error;

      setGmbReviews(gmbReviews.map(r =>
        r.id === reviewId ? { ...r, admin_hidden: !currentHidden } : r
      ));

      toast.success(currentHidden ? 'Review is now visible' : 'Review hidden');
    } catch (error) {
      console.error('Error toggling review visibility:', error);
      toast.error('Failed to update review');
    } finally {
      setHidingReview(null);
    }
  };

  const filteredGmbReviews = gmbReviews.filter(r =>
    r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserReviews = userReviews.filter(r =>
    r.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Review Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Manage and moderate all reviews across the platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews by author, business, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Google Reviews</p>
                <p className="text-2xl font-bold">{gmbReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User Reviews</p>
                <p className="text-2xl font-bold">{userReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <EyeOff className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hidden Reviews</p>
                <p className="text-2xl font-bold">
                  {gmbReviews.filter(r => r.admin_hidden).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="google" className="space-y-4">
        <TabsList>
          <TabsTrigger value="google" className="gap-2">
            <Star className="h-4 w-4" />
            Google Reviews ({filteredGmbReviews.length})
          </TabsTrigger>
          <TabsTrigger value="user" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            User Reviews ({filteredUserReviews.length})
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Download className="h-4 w-4" />
            Import System ({eligibleBusinesses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle>Google My Business Reviews</CardTitle>
              <CardDescription>
                Reviews fetched from Google. Hidden reviews won't display on business profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGmbReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No Google reviews found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGmbReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`border rounded-lg p-4 ${review.admin_hidden ? 'bg-muted/50 opacity-75' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{review.author}</span>
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
                            {review.admin_hidden && (
                              <Badge variant="destructive" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building2 className="h-3 w-3" />
                            <span>{review.business_name}</span>
                            <span>•</span>
                            <span>
                              {review.review_date
                                ? format(new Date(review.review_date), 'MMM d, yyyy')
                                : 'Unknown date'}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-muted-foreground">{review.review_text}</p>
                          )}
                        </div>
                        <Button
                          variant={review.admin_hidden ? 'outline' : 'destructive'}
                          size="sm"
                          onClick={() => toggleGmbReviewVisibility(review.id, review.admin_hidden)}
                          disabled={hidingReview === review.id}
                        >
                          {hidingReview === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : review.admin_hidden ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Hide
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User-Submitted Reviews</CardTitle>
              <CardDescription>
                Reviews submitted by customers through the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUserReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No user reviews found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUserReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{review.author_name}</span>
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
                            {review.vendor_response && (
                              <Badge variant="secondary" className="text-xs">
                                Responded
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building2 className="h-3 w-3" />
                            <span>{review.business_name}</span>
                            <span>•</span>
                            <span>
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-muted-foreground">{review.review_text}</p>
                          )}
                          {review.vendor_response && (
                            <div className="mt-3 pl-4 border-l-2 border-primary/30">
                              <p className="text-sm font-medium text-primary">Vendor Response:</p>
                              <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Google Review Import System</CardTitle>
              <CardDescription>
                Trigger a one-time import of Google reviews for businesses that have a Place ID configured but haven't imported yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleBusinesses.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">All eligible businesses have been imported!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only businesses with a valid Place ID and no previous import will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-lg">{biz.business_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">Place ID: {biz.place_id}</p>
                      </div>
                      <Button
                        onClick={() => handleImport(biz.id, biz.place_id)}
                        disabled={importingBusiness === biz.id}
                        className="gap-2"
                      >
                        {importingBusiness === biz.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Import GMB Reviews
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
