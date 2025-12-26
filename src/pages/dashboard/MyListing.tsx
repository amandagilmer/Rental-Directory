import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { 
  ExternalLink, 
  Star, 
  Eye, 
  Search, 
  MessageSquare, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Image, 
  Clock, 
  DollarSign,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PhotoUpload from '@/components/dashboard/PhotoUpload';
import BusinessHoursEditor from '@/components/dashboard/BusinessHoursEditor';
import ServicesEditor from '@/components/dashboard/ServicesEditor';
import ServiceAreaEditor from '@/components/dashboard/ServiceAreaEditor';
import SocialLinksEditor from '@/components/dashboard/SocialLinksEditor';
import ReviewsManager from '@/components/dashboard/ReviewsManager';

const categories = [
  'Car Rental',
  'Equipment Rental',
  'Event Rental',
  'Storage',
  'Bikes & Scooters',
  'Party Supplies',
  'Trailer Rental',
  'RV Rental',
  'Camper Rental'
];

const listingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

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
  const [analytics, setAnalytics] = useState<Analytics>({ views: 0, searchImpressions: 0 });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  
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

        // Fetch analytics
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

        // Fetch photos
        fetchPhotos(listingData.id);

        // Fetch review count
        const { count } = await supabase
          .from('your_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', listingData.id);
        
        setReviewCount(count || 0);
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
        const { data, error } = await supabase
          .from('business_listings')
          .insert({
            ...formData,
            user_id: user?.id
          })
          .select()
          .single();

        if (error) throw error;
        setListing(data);
        toast.success('Listing created successfully');
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
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no listing exists, show create form
  if (!listing) {
    return <CreateListingForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} saving={saving} />;
  }

  // If listing exists, show management view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{listing.business_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{listing.category}</Badge>
            {listing.is_published ? (
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/business/${generateSlug(listing.business_name)}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Public Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
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
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{analytics.searchImpressions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Photos</p>
                <p className="text-2xl font-bold">{photos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-2xl font-bold">{reviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="gap-2 py-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business Info</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2 py-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2 py-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Units & Listings</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2 py-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="more" className="gap-2 py-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Business Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Basic details about your business that appear on your public listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      className="pl-10"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State ZIP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@yourbusiness.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      className="pl-10"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="is_published" className="font-medium">Publish Listing</Label>
                    <p className="text-sm text-muted-foreground">Make your listing visible to the public</p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <PhotoUpload
            listingId={listing.id}
            photos={photos}
            onPhotosChange={() => fetchPhotos(listing.id)}
          />
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours">
          <BusinessHoursEditor listingId={listing.id} />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <ServicesEditor listingId={listing.id} />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <ReviewsManager listingId={listing.id} />
        </TabsContent>

        {/* More Tab (Service Area, Social Links) */}
        <TabsContent value="more" className="space-y-6">
          <ServiceAreaEditor listingId={listing.id} />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for creating a new listing
function CreateListingForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  saving 
}: { 
  formData: any; 
  setFormData: (data: any) => void; 
  onSubmit: (e: React.FormEvent) => void; 
  saving: boolean;
}) {
  const categories = [
    'Car Rental',
    'Equipment Rental',
    'Event Rental',
    'Storage',
    'Bikes & Scooters',
    'Party Supplies',
    'Trailer Rental',
    'RV Rental',
    'Camper Rental'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Your Business Listing</h1>
        <p className="text-muted-foreground mt-2">
          Get started by filling out your business information. You can add photos, hours, and services after creating your listing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will be displayed publicly on the directory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  className="pl-10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  className="pl-10"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">After creating your listing, you'll be able to:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex flex-col items-center gap-2 p-3">
                <Image className="h-6 w-6" />
                <span className="text-xs">Upload Photos</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3">
                <Clock className="h-6 w-6" />
                <span className="text-xs">Set Hours</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3">
                <DollarSign className="h-6 w-6" />
                <span className="text-xs">Add Services</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3">
                <MessageSquare className="h-6 w-6" />
                <span className="text-xs">Manage Reviews</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
