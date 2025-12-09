import { useParams, Link } from "react-router-dom";
import { getBusinessBySlug } from "@/data/businesses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PhotoGallery } from "@/components/PhotoGallery";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { Footer } from "@/components/Footer";
import BusinessReviews from "@/components/BusinessReviews";
import ReviewModal from "@/components/ReviewModal";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DbListing {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  place_id: string | null;
}

interface DbHours {
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

interface DbService {
  id: string;
  service_name: string;
  description: string | null;
  price: number | null;
  price_unit: string;
  is_available: boolean;
}

interface DbServiceArea {
  area_type: string;
  zip_codes: string[] | null;
  radius_miles: number | null;
}

interface DbPhoto {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
}

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [dbListing, setDbListing] = useState<DbListing | null>(null);
  const [dbHours, setDbHours] = useState<DbHours[]>([]);
  const [dbServices, setDbServices] = useState<DbService[]>([]);
  const [dbServiceArea, setDbServiceArea] = useState<DbServiceArea | null>(null);
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [leadSubmitter, setLeadSubmitter] = useState<{ name: string; email: string } | null>(null);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Try to get mock business first
  const mockBusiness = getBusinessBySlug(slug || "");

  useEffect(() => {
    const fetchDbListing = async () => {
      if (!slug) return;

      // Try to find by slug (lowercase business name with hyphens)
      const { data: listings } = await supabase
        .from('business_listings')
        .select('*')
        .eq('is_published', true);

      const listing = listings?.find(l => 
        l.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
      );

      if (listing) {
        setDbListing(listing as DbListing);

        // Fetch related data in parallel
        const [hoursRes, servicesRes, areaRes, photosRes] = await Promise.all([
          supabase.from('business_hours').select('*').eq('listing_id', listing.id).order('day_of_week'),
          supabase.from('business_services').select('*').eq('listing_id', listing.id).order('display_order'),
          supabase.from('service_areas').select('*').eq('listing_id', listing.id).maybeSingle(),
          supabase.from('business_photos').select('*').eq('listing_id', listing.id).order('display_order')
        ]);

        if (hoursRes.data) setDbHours(hoursRes.data as DbHours[]);
        if (servicesRes.data) setDbServices(servicesRes.data as DbService[]);
        if (areaRes.data) setDbServiceArea(areaRes.data as DbServiceArea);
        if (photosRes.data) setDbPhotos(photosRes.data as DbPhoto[]);
      }

      setLoading(false);
    };

    fetchDbListing();
  }, [slug]);

  // Use DB data if available, otherwise use mock data
  const isDbListing = !!dbListing;
  const business = mockBusiness;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!business && !dbListing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Merge data: prefer DB data when available
  const displayData = {
    name: dbListing?.business_name || business?.name || '',
    description: dbListing?.description || business?.fullDescription || business?.description || '',
    category: dbListing?.category || business?.category || '',
    address: dbListing?.address || business?.address || '',
    phone: dbListing?.phone || business?.phone || '',
    email: dbListing?.email || business?.email || '',
    website: dbListing?.website || business?.website || '',
    image: dbListing?.image_url || business?.image || '/placeholder.svg',
    verified: business?.verified || false,
    rating: business?.rating || 0,
    socialLinks: {
      facebook: dbListing?.facebook_url || business?.socialLinks?.facebook,
      instagram: dbListing?.instagram_url || business?.socialLinks?.instagram,
      twitter: dbListing?.twitter_url || business?.socialLinks?.twitter,
      linkedin: dbListing?.linkedin_url || business?.socialLinks?.linkedin,
      youtube: dbListing?.youtube_url || business?.socialLinks?.youtube,
    }
  };

  // Format hours for display
  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const displayHours = dbHours.length > 0
    ? dbHours.map(h => ({
        day: DAYS[h.day_of_week],
        open: h.open_time ? formatTime(h.open_time) : '',
        close: h.close_time ? formatTime(h.close_time) : '',
        closed: h.is_closed
      }))
    : business?.hours || [];

  // Format services for display
  const displayServices = dbServices.length > 0
    ? dbServices.filter(s => s.is_available).map(s => ({
        name: s.service_name,
        description: s.description || undefined,
        price: s.price_unit === 'contact for pricing' || s.price === null
          ? 'Contact for pricing'
          : `$${s.price.toFixed(2)} ${s.price_unit}`
      }))
    : business?.services || [];

  // Format service areas
  const displayServiceAreas = dbServiceArea
    ? dbServiceArea.area_type === 'zip_code' && dbServiceArea.zip_codes
      ? dbServiceArea.zip_codes
      : [`Within ${dbServiceArea.radius_miles} miles`]
    : business?.serviceArea || [];

  // Get photo URLs
  const getPhotoUrl = (photo: DbPhoto) => {
    const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
    return data.publicUrl;
  };

  const displayPhotos = dbPhotos.length > 0
    ? dbPhotos.map(p => getPhotoUrl(p))
    : business?.photos || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "fill-accent text-accent"
            : "fill-muted text-muted"
        }`}
      />
    ));
  };

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={displayData.image}
          alt={displayData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-card">
            <img
              src={displayData.image}
              alt={displayData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {displayData.name}
              </h1>
              {displayData.verified && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {displayData.rating > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(displayData.rating)}
                  <span className="ml-1 text-foreground font-semibold">
                    {displayData.rating}
                  </span>
                </div>
              )}
              <Badge variant="secondary">{displayData.category}</Badge>
            </div>
          </div>
          <Link to="/" className="hidden md:block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {displayData.description && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {displayData.description}
                </p>
              </Card>
            )}

            {/* Photo Gallery */}
            {displayPhotos.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">Photos</h2>
                <PhotoGallery photos={displayPhotos} businessName={displayData.name} />
              </Card>
            )}

            {/* Hours of Operation */}
            {displayHours.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Hours of Operation
                </h2>
                <div className="space-y-2">
                  {displayHours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="font-medium text-foreground">{hour.day}</span>
                      <span className="text-muted-foreground">
                        {hour.closed ? "Closed" : hour.open === "24 Hours" ? "24 Hours" : `${hour.open} - ${hour.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Service Area */}
            {displayServiceAreas.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Service Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {displayServiceAreas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Services */}
            {displayServices.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Services & Pricing
                </h2>
                <div className="space-y-4">
                  {displayServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                      {service.price && (
                        <span className="text-primary font-semibold whitespace-nowrap ml-4">
                          {service.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews - New Component */}
            {dbListing?.id && (
              <BusinessReviews 
                businessId={dbListing.id} 
                placeId={dbListing.place_id} 
              />
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Contact Card */}
              <Card className="p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {displayData.phone && (
                    <a
                      href={`tel:${displayData.phone}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{displayData.phone}</span>
                    </a>
                  )}

                  {displayData.email && (
                    <a
                      href={`mailto:${displayData.email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="truncate">{displayData.email}</span>
                    </a>
                  )}

                  {displayData.website && (
                    <a
                      href={displayData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="truncate">Visit Website</span>
                    </a>
                  )}

                  {displayData.address && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{displayData.address}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {Object.values(displayData.socialLinks).some(Boolean) && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Follow Us
                    </h3>
                    <div className="flex gap-2">
                      {Object.entries(displayData.socialLinks).map(([platform, url]) => {
                        const Icon = socialIcons[platform as keyof typeof socialIcons];
                        if (!Icon || !url) return null;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Request Quote CTA */}
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={() => setLeadModalOpen(true)}
              >
                Request a Quote
              </Button>

              {/* Back to Directory (Mobile) */}
              <Link to="/" className="block md:hidden">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <LeadCaptureModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        businessName={displayData.name}
        businessId={dbListing?.id || business?.slug || ''}
        services={displayServices}
        onLeadSubmitted={(data) => {
          setLeadSubmitter(data);
          // Trigger review modal after 5 minutes (300000ms) - using 10s for testing
          if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
          reviewTimerRef.current = setTimeout(() => {
            setReviewModalOpen(true);
          }, 300000); // 5 minutes
        }}
      />

      {leadSubmitter && dbListing?.id && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setLeadSubmitter(null);
          }}
          businessId={dbListing.id}
          businessName={displayData.name}
          authorName={leadSubmitter.name}
          authorEmail={leadSubmitter.email}
        />
      )}
    </div>
  );
};

export default BusinessDetail;
