import { useParams, Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PhotoGallery } from "@/components/PhotoGallery";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { Footer } from "@/components/Footer";
import BusinessReviews from "@/components/BusinessReviews";
import ReviewModal from "@/components/ReviewModal";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
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
  Shield,
  Heart,
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
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  place_id: string | null;
  booking_url: string | null;
  claimed: boolean;
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
  daily_rate: number | null;
  asset_class: string | null;
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
  const hasTrackedView = useRef(false);

  // Interaction tracking
  const {
    trackProfileView,
    trackClickToCall,
    trackClickToEmail,
    trackClickWebsite,
    trackClickBooking,
    trackClickSocial,
    trackButtonClick,
    trackFormSubmit
  } = useInteractionTracking(dbListing?.id || null);

  const { isFavorite, toggleFavorite } = useFavorites(dbListing?.id);



  useEffect(() => {
    const fetchDbListing = async () => {
      if (!slug) return;

      // Find by slug directly
      const { data: listing, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

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
      } else {
        console.log('No listing found for slug:', slug);
      }

      setLoading(false);
    };

    fetchDbListing();
  }, [slug]);

  // Track profile view once when listing is loaded
  useEffect(() => {
    if (dbListing?.id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackProfileView();
    }
  }, [dbListing?.id, trackProfileView]);

  // Use DB data if available, otherwise use mock data
  const isDbListing = !!dbListing;


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!dbListing) {
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
    name: dbListing?.business_name || '',
    description: dbListing?.description || '',
    category: dbListing?.category || '',
    address: dbListing?.address || '',
    phone: dbListing?.phone || '',
    email: dbListing?.email || '',
    website: dbListing?.website || '',
    bookingUrl: dbListing?.booking_url || null,
    image: dbListing?.image_url || '/placeholder.svg',
    logo: dbListing?.logo_url || dbListing?.image_url || '/placeholder.svg',
    verified: dbListing?.claimed || false,
    rating: 0, // Default rating if no mock data
    socialLinks: {
      facebook: dbListing?.facebook_url,
      instagram: dbListing?.instagram_url,
      twitter: dbListing?.twitter_url,
      linkedin: dbListing?.linkedin_url,
      youtube: dbListing?.youtube_url,
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
    : [];

  // Format services for display - keep full data for linking
  const displayServices = dbServices.length > 0
    ? dbServices.filter(s => s.is_available).map(s => ({
      id: s.id,
      name: s.service_name,
      description: s.description || undefined,
      price: s.price_unit === 'contact for pricing' || s.price === null
        ? 'Contact for pricing'
        : `$${s.price.toFixed(2)} ${s.price_unit}`,
      dailyRate: s.daily_rate,
      assetClass: s.asset_class,
    }))
    : [];

  // Format service areas
  const displayServiceAreas = dbServiceArea
    ? dbServiceArea.area_type === 'zip_code' && dbServiceArea.zip_codes
      ? dbServiceArea.zip_codes
      : [`Within ${dbServiceArea.radius_miles} miles`]
    : [];

  // Get photo URLs
  const getPhotoUrl = (photo: DbPhoto) => {
    const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
    return data.publicUrl;
  };

  const displayPhotos = dbPhotos.length > 0
    ? dbPhotos.map(p => getPhotoUrl(p))
    : [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.floor(rating)
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
      {/* Branded Header */}
      <header className="bg-secondary sticky top-0 z-50">
        <div className="h-1 bg-primary" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <span className="font-display font-bold text-base text-primary-foreground">PH</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-lg tracking-wide text-primary-foreground">
                  Patriot Hauls
                </span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Directory</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Photo Banner */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img
          src={displayData.image}
          alt={displayData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-card">
            <img
              src={displayData.logo}
              alt={displayData.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="flex-1">
            {/* Business Title - Anonymized */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wide">
                Verified {displayData.category || "Rental"} Fleet
                {/* Was: Verified {category} Partner */}
              </h1>
              {displayData.verified && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 hover:bg-transparent"
                onClick={toggleFavorite}
              >
                <Heart className={`h-6 w-6 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
              </Button>
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
              {/* Operator Badges */}
              {dbListing?.id && (
                <BadgeDisplay listingId={dbListing.id} size="md" maxDisplay={5} />
              )}
            </div>
          </div>
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
                <h2 className="text-xl font-bold text-foreground mb-4">Fleet Photos</h2>
                <PhotoGallery photos={displayPhotos} businessName={`Verified ${displayData.category || 'Rental'} Fleet`} />
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
                      <span className="font-medium text-foreground">
                        {hour.day}
                      </span>
                      <span className="text-muted-foreground">
                        {hour.closed
                          ? "Closed"
                          : hour.open === "24 Hours"
                            ? "24 Hours"
                            : `${hour.open} - ${hour.close}`}
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

            {/* Fleet Units / Services */}
            {displayServices.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Fleet Units
                </h2>
                <div className="space-y-4">
                  {displayServices.map((service, index) => {
                    const isRealUnit = !service.id.startsWith("mock-");
                    const unitLink = isRealUnit
                      ? `/business/${slug}/unit/${service.id}`
                      : null;

                    const content = (
                      <div
                        className={`flex justify-between items-start py-4 border-b border-border last:border-0 ${unitLink ? 'hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors cursor-pointer' : ''
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {service.name}
                            </h3>
                            {service.assetClass && (
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {service.assetClass}
                              </span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          {unitLink && (
                            <span className="text-xs text-primary mt-1 inline-block">
                              View Details →
                            </span>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {service.dailyRate ? (
                            <div>
                              <span className="text-primary font-bold text-lg">
                                ${service.dailyRate}
                              </span>
                              <span className="text-muted-foreground text-sm">/day</span>
                            </div>
                          ) : service.price ? (
                            <span className="text-primary font-semibold whitespace-nowrap">
                              {service.price}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );

                    return unitLink ? (
                      <Link key={index} to={unitLink}>
                        {content}
                      </Link>
                    ) : (
                      <div key={index}>{content}</div>
                    );
                  })}
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
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              {/* Contact Card - STRIPPED for Lead Vending Model */}
              <Card className="p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Rental Inquiry
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Interested in this rental? Request a quote to check availability and get pricing directly from our verified fleet operator.
                  </p>

                  {/* Hidden Contact Info for Privacy/Lead Model
                  {displayData.phone && (...)}
                  {displayData.email && (...)}
                  {displayData.website && (...)}
                  {displayData.address && (...)}
                  */}
                </div>

                {/* Social Links Hidden 
                {Object.values(displayData.socialLinks).some(Boolean) && (...)}
                */}

                {/* Book Now Hidden (External Link) 
                {displayData.bookingUrl && (...)}
                */}

                {/* Request Quote CTA - Primary Action */}
                <div className="mt-6">
                  <Button
                    size="lg"
                    className="w-full text-lg py-6 bg-primary hover:bg-primary/90 shadow-lg animate-pulse hover:animate-none"
                    onClick={() => {
                      trackButtonClick('request_quote');
                      setLeadModalOpen(true);
                    }}
                  >
                    Request Availability
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Response time: Usually within 1 hour
                  </p>
                </div>
              </Card>

              {/* Back to Directory (Mobile) */}
              <Link to="/" className="block md:hidden">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Directory
                </Button>
              </Link>

              {/* Claim Business Card */}
              {!displayData.verified && (
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground">
                        Own this business?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Claim this listing to update your information, manage reviews, and receive leads directly.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          window.location.href = `/claim/${slug}`;
                        }}
                      >
                        Claim This Listing
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />

      <LeadCaptureModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        businessName={`Verified ${displayData.category || 'Rental'} Fleet`}
        businessId={dbListing?.id || ''}
        services={displayServices}
        onLeadSubmitted={(data) => {
          trackFormSubmit('lead_form');
          setLeadSubmitter(data);
          // Trigger review modal after 5 minutes (300000ms)
          if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
          reviewTimerRef.current = setTimeout(() => {
            setReviewModalOpen(true);
          }, 300000); // 5 minutes
        }}
      />

      {
        leadSubmitter && dbListing?.id && (
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setLeadSubmitter(null);
            }}
            businessId={dbListing.id}
            businessName={`Verified ${displayData.category || 'Rental'} Fleet`}
            authorName={leadSubmitter.name}
            authorEmail={leadSubmitter.email}
          />
        )
      }
    </div >
  );
};

export default BusinessDetail;
