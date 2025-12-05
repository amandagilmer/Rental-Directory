import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { ExternalLink, Star, Eye, Search, MessageSquare, TrendingUp, Edit, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhotoUpload from '@/components/dashboard/PhotoUpload';
import BusinessHoursEditor from '@/components/dashboard/BusinessHoursEditor';
import ServicesEditor from '@/components/dashboard/ServicesEditor';
import ServiceAreaEditor from '@/components/dashboard/ServiceAreaEditor';
import SocialLinksEditor from '@/components/dashboard/SocialLinksEditor';

const categories = [
  'Car Rental',
  'Equipment Rental',
  'Event Rental',
  'Storage',
  'Bikes & Scooters',
  'Party Supplies'
];

const listingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

interface GmbStats {
  rating: number;
  reviewCount: number;
  recentReviews: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

interface Analytics {
  views: number;
  searchImpressions: number;
}

interface Photo {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

export default function MyListing() {
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [gmbStats, setGmbStats] = useState<GmbStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({ views: 0, searchImpressions: 0 });
  const [hasGmbConnection, setHasGmbConnection] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    is_published: false
  });

  const fetchPhotos = useCallback(async (listingId: string) => {
    const { data } = await supabase
      .from('business_photos')
      .select('*')
      .eq('listing_id', listingId)
      .order('display_order', { ascending: true });
    
    if (data) {
      setPhotos(data as Photo[]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch listing
      const { data: listingData } = await supabase
        .from('business_listings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (listingData) {
        setListing(listingData);
        setFormData({
          business_name: listingData.business_name || '',
          description: listingData.description || '',
          category: listingData.category || '',
          address: listingData.address || '',
          phone: listingData.phone || '',
          email: listingData.email || '',
          website: listingData.website || '',
          is_published: listingData.is_published || false
        });

        // Fetch analytics for this listing
        const { data: analyticsData } = await supabase
          .from('listing_analytics')
          .select('views, search_impressions')
          .eq('listing_id', listingData.id)
          .order('date', { ascending: false })
          .limit(30);

        if (analyticsData && analyticsData.length > 0) {
          const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
          const totalImpressions = analyticsData.reduce((sum, a) => sum + (a.search_impressions || 0), 0);
          setAnalytics({ views: totalViews, searchImpressions: totalImpressions });
        }

        // Fetch photos for this listing
        fetchPhotos(listingData.id);
      }

      // Check GMB connection and fetch stats
      const { data: gmbConnection } = await supabase
        .from('gmb_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (gmbConnection) {
        setHasGmbConnection(true);
        // Mock GMB stats - in production this would come from GMB API
        setGmbStats({
          rating: 4.7,
          reviewCount: 28,
          recentReviews: [
            { author: 'John D.', rating: 5, text: 'Excellent service! Highly recommend.', date: '2024-12-01' },
            { author: 'Sarah M.', rating: 4, text: 'Good experience, will come back.', date: '2024-11-28' },
            { author: 'Mike R.', rating: 5, text: 'Best rental business in town!', date: '2024-11-25' },
          ]
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user, fetchPhotos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      listingSchema.parse(formData);
      setSaving(true);

      if (listing) {
        const { error } = await supabase
          .from('business_listings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', listing.id);

        if (error) throw error;
        toast.success('Listing updated successfully');
      } else {
        const { error } = await supabase
          .from('business_listings')
          .insert({
            ...formData,
            user_id: user?.id
          });

        if (error) throw error;
        toast.success('Listing created successfully');
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Business Listing</h1>
          <p className="text-muted-foreground mt-2">
            {listing ? 'Manage and preview your business listing' : 'Create your business listing'}
          </p>
        </div>
        {listing && listing.is_published && (
          <Link to={`/business/${generateSlug(listing.business_name)}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Live Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      {listing && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{analytics.views}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Search Impressions</p>
                  <p className="text-2xl font-bold">{analytics.searchImpressions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {hasGmbConnection && gmbStats && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Google Rating</p>
                      <p className="text-2xl font-bold">{gmbStats.rating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Google Reviews</p>
                      <p className="text-2xl font-bold">{gmbStats.reviewCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Google Reviews Section */}
      {hasGmbConnection && gmbStats && gmbStats.recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recent Google Reviews
            </CardTitle>
            <CardDescription>
              Latest reviews from your Google My Business profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gmbStats.recentReviews.map((review, index) => (
                <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.author}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                </div>
              ))}
            </div>
            <Link to="/dashboard/gmb" className="block mt-4">
              <Button variant="outline" size="sm">
                Manage GMB Integration
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {listing && (
        <div className="flex gap-2 border-b border-border pb-2">
          <Button
            variant={activeTab === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('edit')}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Listing
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('preview')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && listing ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{formData.business_name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{formData.category}</Badge>
                  {formData.is_published ? (
                    <Badge className="bg-green-500">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
              {hasGmbConnection && gmbStats && (
                <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{gmbStats.rating}</span>
                  <span className="text-muted-foreground text-sm">({gmbStats.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.description && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{formData.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{formData.address}</p>
                  </div>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                  </div>
                </div>
              )}
              {formData.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                  </div>
                </div>
              )}
              {formData.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {formData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Gallery Preview */}
            {photos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {photos.slice(0, 4).map((photo) => {
                    const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
                    return (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={data.publicUrl}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
                {photos.length > 4 && (
                  <p className="text-sm text-muted-foreground mt-2">+{photos.length - 4} more photos</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This is how your listing appears to customers. Click "Edit Listing" to make changes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Tab / Form */
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              This information will be displayed publicly on the directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your rental business..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Publish listing (make visible to public)</Label>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : listing ? 'Update Listing' : 'Create Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      {listing && activeTab === 'edit' && (
        <PhotoUpload
          listingId={listing.id}
          photos={photos}
          onPhotosChange={() => fetchPhotos(listing.id)}
        />
      )}

      {/* Business Hours Section */}
      {listing && activeTab === 'edit' && (
        <BusinessHoursEditor listingId={listing.id} />
      )}

      {/* Services & Pricing Section */}
      {listing && activeTab === 'edit' && (
        <ServicesEditor listingId={listing.id} />
      )}

      {/* Service Area Section */}
      {listing && activeTab === 'edit' && (
        <ServiceAreaEditor listingId={listing.id} />
      )}

      {/* Social Links Section */}
      {listing && activeTab === 'edit' && (
        <SocialLinksEditor
          listingId={listing.id}
          initialData={{
            facebook_url: listing.facebook_url,
            instagram_url: listing.instagram_url,
            twitter_url: listing.twitter_url,
            linkedin_url: listing.linkedin_url,
            youtube_url: listing.youtube_url
          }}
          onSave={() => {
            // Refresh listing data
            window.location.reload();
          }}
        />
      )}

      {/* Tips Card */}
      {listing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tips to Improve Your Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {!formData.description && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Add a description to help customers understand your business
                </li>
              )}
              {!formData.phone && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Add a phone number so customers can contact you directly
                </li>
              )}
              {!formData.website && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Add your website to drive more traffic
                </li>
              )}
              {photos.length === 0 && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Add photos to showcase your inventory and attract more customers
                </li>
              )}
              {!hasGmbConnection && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <Link to="/dashboard/gmb" className="text-primary hover:underline">
                    Connect Google My Business
                  </Link>{' '}
                  to display your reviews and ratings
                </li>
              )}
              {!formData.is_published && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Your listing is not published. Toggle "Publish listing" to make it visible
                </li>
              )}
              {formData.description && formData.phone && formData.website && hasGmbConnection && formData.is_published && photos.length > 0 && (
                <li className="flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Great job! Your listing is fully optimized
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
