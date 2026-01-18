import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  ExternalLink,
  Star,
  Eye,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ServicesEditor from '@/components/dashboard/ServicesEditor';
import { useCategories } from '@/hooks/useCategories';


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

interface DbListing {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_published: boolean;
  slug: string | null;
}

interface FormData {
  business_name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_published: boolean;
}

interface PendingClaim {
  id: string;
  status: string;
  business?: {
    business_name: string;
  };
}

export default function MyListing() {
  const { user } = useAuth();
  const [listing, setListing] = useState<DbListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({ views: 0, searchImpressions: 0 });
  const [reviewCount, setReviewCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    is_published: false
  });

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

        // Fetch unit count
        const { count: unitsCount } = await supabase
          .from('business_services')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', listingData.id);

        setUnitCount(unitsCount || 0);

        // Fetch review count
        const { count } = await supabase
          .from('your_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', listingData.id);

        setReviewCount(count || 0);
      } else {
        // Check for pending claims
        const { data: claimData } = await supabase
          .from('business_claims')
          .select('*, business:business_listings(business_name)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (claimData) {
          setPendingClaim(claimData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      listingSchema.parse(formData);
      setSaving(true);

      const sanitizeName = (name: string) => name.replace(/(.{2,})\1{2,}/g, '$1');
      const cleanName = sanitizeName(formData.business_name);

      if (listing) {
        const { error } = await supabase
          .from('business_listings')
          .update({
            ...formData,
            business_name: cleanName,
            slug: generateSlug(cleanName),
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
            business_name: cleanName,
            slug: generateSlug(cleanName),
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

  // If no listing exists, check for pending claim first
  if (pendingClaim) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 mb-6 group">
            <Shield className="h-10 w-10 text-yellow-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Verification In Progress</h1>
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-muted-foreground text-lg">
              Your claim for <span className="font-bold text-foreground">{pendingClaim.business?.business_name || 'your business'}</span> is currently being reviewed by our command team.
            </p>
            <Alert className="bg-blue-500/5 border-blue-500/20 text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Next Steps</AlertTitle>
              <AlertDescription>
                You will receive a notification of approval or denial within 24 hours. Once approved, this listing will be assigned to your account and you'll gain full access to the Command Center features.
              </AlertDescription>
            </Alert>
            <div className="pt-6">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <Link to={`/business/${listing.slug || generateSlug(listing.business_name)}`} target="_blank">
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
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Units</p>
                <p className="text-2xl font-bold">{unitCount}</p>
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

      {/* Units & Listings */}
      <ServicesEditor listingId={listing.id} />
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
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}) {
  const { categories, loading: categoriesLoading } = useCategories();

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
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
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
            <p className="text-sm">After creating your listing, you'll be able to add units and photos.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}