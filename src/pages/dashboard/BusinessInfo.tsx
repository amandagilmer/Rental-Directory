import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Loader2,
  Flag,
  Clock,
  Camera,
  Shield,
  CheckCircle2,
  Star,
  Medal
} from 'lucide-react';
import BusinessHoursEditor from '@/components/dashboard/BusinessHoursEditor';
import ServiceAreaEditor from '@/components/dashboard/ServiceAreaEditor';
import SocialLinksEditor from '@/components/dashboard/SocialLinksEditor';
import PhotoUpload from '@/components/dashboard/PhotoUpload';
import LogoUpload from '@/components/dashboard/LogoUpload';
import BadgeSubmissionModal from '@/components/dashboard/BadgeSubmissionModal';
import { LocationPicker } from '@/components/dashboard/LocationPicker';
import { AIDescriptionEnhancer } from '@/components/AIDescriptionEnhancer';
import { useCategories } from '@/hooks/useCategories';

interface Photo {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

// Categories are now fetched from database via useCategories hook

const listingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  owner_name: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  booking_url: z.string().url('Invalid booking URL').optional().or(z.literal('')),
  show_exact_location: z.boolean().optional(),
});

export default function BusinessInfo() {
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [badgeModal, setBadgeModal] = useState<{
    open: boolean;
    badgeKey: string;
    badgeName: string;
    badgeDescription: string;
    documentType: string;
  }>({
    open: false,
    badgeKey: '',
    badgeName: '',
    badgeDescription: '',
    documentType: '',
  });

  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    description: '',
    category: '',
    additional_categories: [] as string[],
    address: '',
    phone: '',
    email: '',
    website: '',
    booking_url: '',
    is_published: false,
    show_exact_location: true,
    latitude: 31.9686, // Default Texas
    longitude: -99.9018
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
        setLogoUrl(listingData.logo_url);
        setFormData({
          business_name: listingData.business_name || '',
          owner_name: listingData.owner_name || '',
          description: listingData.description || '',
          category: listingData.category || '',
          additional_categories: listingData.additional_categories || [],
          address: listingData.address || '',
          phone: listingData.phone || '',
          email: listingData.email || '',
          website: listingData.website || '',
          booking_url: listingData.booking_url || '',
          is_published: listingData.is_published || false,
          show_exact_location: listingData.show_exact_location ?? true,
          latitude: listingData.latitude || 31.9686,
          longitude: listingData.longitude || -99.9018
        });
        fetchPhotos(listingData.id);
      } else {
        // Check for pending claims
        const { data: claimData } = await supabase
          .from('business_claims')
          .select('*, business:business_listings(*)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (claimData?.business) {
          const b = claimData.business as any;
          setIsPending(true);
          // Pre-populate but don't set 'listing' yet as they don't officially own it
          setLogoUrl(b.logo_url);
          setFormData({
            business_name: b.business_name || '',
            owner_name: b.owner_name || '',
            description: b.description || '',
            category: b.category || '',
            additional_categories: b.additional_categories || [],
            address: b.address || '',
            phone: b.phone || '',
            email: b.email || '',
            website: b.website || '',
            booking_url: b.booking_url || '',
            is_published: b.is_published || false,
            show_exact_location: b.show_exact_location ?? true,
            latitude: b.latitude || 31.9686,
            longitude: b.longitude || -99.9018
          });
          fetchPhotos(b.id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, fetchPhotos]);


  // Removed old geocodeAddress function in favor of LocationPicker logic
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      listingSchema.parse(formData);
      setSaving(true);

      const sanitizeName = (name: string) => name.replace(/(.{2,})\1{2,}/g, '$1');
      const cleanName = sanitizeName(formData.business_name);

      const updateData = {
        ...formData,
        business_name: cleanName,
        updated_at: new Date().toISOString()
      };

      if (listing) {
        const { error } = await supabase
          .from('business_listings')
          .update({
            ...updateData,
            slug: generateSlug(cleanName)
          })
          .eq('id', listing.id);

        if (error) throw error;
        toast.success('Business information updated successfully');
      } else {
        const { data, error } = await supabase
          .from('business_listings')
          .insert({
            ...updateData,
            slug: generateSlug(cleanName),
            user_id: user?.id
          })
          .select()
          .single();

        if (error) throw error;
        setListing(data);
        toast.success('Business created successfully');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tactical Tabs */}
      <Tabs defaultValue="identity" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="bg-muted/30 rounded-full p-1 h-auto">
            <TabsTrigger
              value="identity"
              className="gap-2 px-6 py-2.5 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Flag className="h-4 w-4" />
              <span className="uppercase text-xs font-semibold tracking-wide">Identity</span>
            </TabsTrigger>
            <TabsTrigger
              value="logistics"
              className="gap-2 px-6 py-2.5 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span className="uppercase text-xs font-semibold tracking-wide">Logistics & Hours</span>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="gap-2 px-6 py-2.5 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Camera className="h-4 w-4" />
              <span className="uppercase text-xs font-semibold tracking-wide">Media & Brand</span>
            </TabsTrigger>
            <TabsTrigger
              value="trust"
              className="gap-2 px-6 py-2.5 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              <span className="uppercase text-xs font-semibold tracking-wide">Trust Protocol</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Identity Tab */}
        <TabsContent value="identity">
          <Card className="bg-card border-0 shadow-md rounded-xl max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-bold italic uppercase tracking-wide text-foreground">
                  Identity Core
                </h2>
                {formData.is_published && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-green-500 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Active Signal
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-yellow-500 text-yellow-600 bg-yellow-500/5 animate-pulse">
                    <Shield className="h-3 w-3" />
                    Pending Verification
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Business Name
                    </Label>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="Liberty Flatbeds & Hauling"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Owner Full Name
                    </Label>
                    <Input
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="James 'Big Jim' Carter"
                    />
                  </div>
                </div>

                {/* Business Address - Important for Map Display */}
                <div className="space-y-2">
                  <LocationPicker
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                    initialAddress={formData.address}
                    initialLat={formData.latitude}
                    initialLng={formData.longitude}
                    initialExact={formData.show_exact_location}
                    onLocationChange={(lat, lng, address, exact) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        address: address, // In a real app we might not want to overwrite address unless confirmed
                        show_exact_location: exact
                      }));
                    }}
                  />
                </div>

                {/* Categories Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Primary Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-muted/30 border-0 h-12">
                        <SelectValue placeholder="Select primary category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Additional Categories
                    </Label>
                    <div className="grid grid-cols-1 gap-2 p-4 bg-muted/30 rounded-lg">
                      {categories
                        .filter(cat => cat.name !== formData.category)
                        .map((cat) => (
                          <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${cat.id}`}
                              checked={formData.additional_categories.includes(cat.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    additional_categories: [...formData.additional_categories, cat.name]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    additional_categories: formData.additional_categories.filter(c => c !== cat.name)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                              {cat.name}
                            </label>
                          </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select all that apply. Your business will appear in these category filters.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tactical Phone
                    </Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="555-0101"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Business Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="jim@libertyhaul.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Website URL
                    </Label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      External Booking URL
                    </Label>
                    <Input
                      type="url"
                      value={formData.booking_url}
                      onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                      className="bg-muted/30 border-0 h-12"
                      placeholder="https://booking.example.com"
                    />
                    <p className="text-xs text-muted-foreground">Link to your booking/scheduling system (Calendly, etc.)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mission Briefing (Description)
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/30 border-0 min-h-[120px] resize-y"
                    placeholder="We are a family-owned and operated hauling business serving the heart of Texas. Our mission is to provide rugged, reliable trailers for fellow Americans who need to get the job done right."
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
                    <AIDescriptionEnhancer
                      currentDescription={formData.description}
                      itemName={formData.business_name}
                      itemType="business"
                      onUseDescription={(desc) => setFormData({ ...formData, description: desc })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-medium">Publish Listing</Label>
                    <p className="text-sm text-muted-foreground">Make your listing visible to the public</p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold uppercase tracking-widest"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Core Identity'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics">
          <div className="max-w-5xl mx-auto">
            {listing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-0 shadow-md rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="font-display text-2xl font-bold italic uppercase tracking-wide text-foreground mb-6">
                      Operational Hours
                    </h2>
                    <BusinessHoursEditor listingId={listing.id} />
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <ServiceAreaEditor listingId={listing.id} />
                </div>
              </div>
            ) : (
              <Card className="bg-card border-0 shadow-md rounded-xl">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Create Your Business First</h3>
                  <p className="text-muted-foreground">
                    Save your business details in the Identity tab to set up logistics.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card className="bg-card border-0 shadow-md rounded-xl max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-bold italic uppercase tracking-wide text-foreground mb-6">
                Brand & Media Asset Management
              </h2>

              {listing ? (
                <div className="space-y-8">
                  <LogoUpload
                    listingId={listing.id}
                    currentLogoUrl={logoUrl}
                    onLogoChange={(url) => setLogoUrl(url)}
                  />

                  <div className="border-t border-border my-6"></div>

                  <PhotoUpload
                    listingId={listing.id}
                    photos={photos}
                    onPhotosChange={() => fetchPhotos(listing.id)}
                  />

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
                      window.location.reload();
                    }}
                  />
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Create Your Business First</h3>
                  <p className="text-muted-foreground">
                    Save your business details in the Identity tab to upload media.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Protocol Tab */}
        <TabsContent value="trust">
          <div className="max-w-5xl mx-auto">
            {listing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* VERIFIED OPERATOR Card */}
                <Card className="bg-card border-0 shadow-md rounded-xl text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-1">
                      VERIFIED OPERATOR
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                      Real Business. Real Mission.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Requires Identity & Business Verification.
                    </p>
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold uppercase tracking-wider"
                      onClick={() => setBadgeModal({
                        open: true,
                        badgeKey: 'verified_operator',
                        badgeName: 'VERIFIED OPERATOR',
                        badgeDescription: 'Verify your identity and business to earn this mark of trust.',
                        documentType: 'Government ID & Business License',
                      })}
                    >
                      Submit Protocol
                    </Button>
                  </CardContent>
                </Card>

                {/* VETERAN OWNED Card */}
                <Card className="bg-card border-0 shadow-md rounded-xl text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-1">
                      VETERAN OWNED
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                      Honor. Duty. Service.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Submit DD-214 or Veteran ID.
                    </p>
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold uppercase tracking-wider"
                      onClick={() => setBadgeModal({
                        open: true,
                        badgeKey: 'veteran_owned',
                        badgeName: 'VETERAN OWNED',
                        badgeDescription: 'Verify your status as a U.S. military veteran.',
                        documentType: 'Veteran Documentation (DD-214 or ID)',
                      })}
                    >
                      Submit Protocol
                    </Button>
                  </CardContent>
                </Card>

                {/* INSURED & BONDED Card */}
                <Card className="bg-card border-0 shadow-md rounded-xl text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-1">
                      INSURED & BONDED
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                      Protection for the Mission.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Upload Proof of COI.
                    </p>
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold uppercase tracking-wider"
                      onClick={() => setBadgeModal({
                        open: true,
                        badgeKey: 'insured',
                        badgeName: 'INSURED & BONDED',
                        badgeDescription: 'Upload your current certificate of insurance.',
                        documentType: 'Insurance COI',
                      })}
                    >
                      Submit Protocol
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card border-0 shadow-md rounded-xl">
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Create Your Business First</h3>
                  <p className="text-muted-foreground">
                    Save your business details in the Identity tab to submit for badges.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {listing && (
        <BadgeSubmissionModal
          open={badgeModal.open}
          onOpenChange={(open) => setBadgeModal({ ...badgeModal, open })}
          listingId={listing.id}
          badgeKey={badgeModal.badgeKey}
          badgeName={badgeModal.badgeName}
          badgeDescription={badgeModal.badgeDescription}
          documentType={badgeModal.documentType}
        />
      )}
    </div>
  );
}
