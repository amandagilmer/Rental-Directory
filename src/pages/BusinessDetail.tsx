import { useParams, Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
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
import { Header } from "@/components/Header";
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
  Package,
  Weight,
  Loader2,
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
  user_id: string;
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
  tow_capacity: string | null;
  photos?: DbPhoto[];
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
  const [hasPendingClaim, setHasPendingClaim] = useState(false);
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

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getSession();
  }, []);

  const { isFavorite, toggleFavorite } = useFavorites(dbListing?.id);

  // Helper functions
  const getPhotoUrl = (photo: DbPhoto) => {
    if (!photo || !photo.storage_path) return '/placeholder.svg';
    try {
      const { data } = supabase.storage.from('business-photos').getPublicUrl(photo.storage_path);
      return data?.publicUrl || '/placeholder.svg';
    } catch (err) {
      console.error('Error getting photo URL:', err);
      return '/placeholder.svg';
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchDbListing = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const { data: listing, error: listingError } = await supabase
          .from('business_listings')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (listingError) throw listingError;

        if (listing) {
          setDbListing(listing as DbListing);

          const [hoursRes, servicesRes, areaRes, photosRes, claimsRes] = await Promise.allSettled([
            supabase.from('business_hours').select('*').eq('listing_id', listing.id).order('day_of_week'),
            supabase.from('business_services').select('*').eq('listing_id', listing.id).order('display_order'),
            supabase.from('service_areas').select('*').eq('listing_id', listing.id).maybeSingle(),
            supabase.from('business_photos').select('*').eq('listing_id', listing.id).order('display_order'),
            supabase.from('business_claims').select('id').eq('business_id', listing.id).eq('status', 'pending').limit(1)
          ]);

          if (hoursRes.status === 'fulfilled' && hoursRes.value.data) {
            setDbHours(hoursRes.value.data as DbHours[]);
          }

          if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
            let servicesData = servicesRes.value.data || [];
            if (servicesData.length > 0) {
              const { data: servicePhotos } = await supabase
                .from('service_photos')
                .select('*')
                .in('service_id', servicesData.map(s => s.id));

              if (servicePhotos) {
                servicesData = servicesData.map(s => ({
                  ...s,
                  photos: servicePhotos.filter(p => p.service_id === s.id)
                }));
              }
            }
            setDbServices(servicesData as DbService[]);
          }

          if (areaRes.status === 'fulfilled' && areaRes.value.data) {
            setDbServiceArea(areaRes.value.data as DbServiceArea);
          }
          if (photosRes.status === 'fulfilled' && photosRes.value.data) {
            setDbPhotos(photosRes.value.data as DbPhoto[]);
          }

          if (claimsRes.status === 'fulfilled' && claimsRes.value.data && claimsRes.value.data.length > 0) {
            setHasPendingClaim(true);
          }
        }
      } catch (err) {
        console.error('Error fetching business detail data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDbListing();
  }, [slug]);

  useEffect(() => {
    if (dbListing?.id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      try {
        trackProfileView();
      } catch (err) {
        console.error('Safe-guarded tracking crash:', err);
      }
    }
  }, [dbListing?.id, trackProfileView]);

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
    rating: 0,
    socialLinks: {
      facebook: dbListing?.facebook_url,
      instagram: dbListing?.instagram_url,
      twitter: dbListing?.twitter_url,
      linkedin: dbListing?.linkedin_url,
      youtube: dbListing?.youtube_url,
    }
  };

  const displayHours = dbHours.length > 0
    ? dbHours.map(h => ({
      day: DAYS[h.day_of_week],
      open: h.open_time ? formatTime(h.open_time) : '',
      close: h.close_time ? formatTime(h.close_time) : '',
      closed: h.is_closed
    }))
    : [];

  const displayServices = dbServices.length > 0
    ? dbServices.filter(s => s && s.is_available).map(s => {
      try {
        return {
          id: s.id,
          name: s.service_name,
          description: s.description || undefined,
          price: s.price_unit === 'contact for pricing' || s.price === null
            ? 'Contact for pricing'
            : `$${Number(s.price).toFixed(2)} ${s.price_unit}`,
          dailyRate: s.daily_rate,
          assetClass: s.asset_class,
          towCapacity: s.tow_capacity,
          thumbnail: s.photos && s.photos.length > 0
            ? getPhotoUrl(s.photos.find(p => p && p.is_primary) || s.photos[0])
            : null,
        }
      } catch (err) {
        console.error('Error mapping service:', s.id, err);
        return null;
      }
    }).filter(Boolean) as {
      id: string;
      name: string;
      description?: string;
      price: string;
      dailyRate: number | null;
      assetClass: string | null;
      towCapacity: string | null;
      thumbnail: string | null;
    }[]
    : [];

  const displayServiceAreas = dbServiceArea
    ? dbServiceArea.area_type === 'zip_code' && dbServiceArea.zip_codes
      ? dbServiceArea.zip_codes
      : [`Within ${dbServiceArea.radius_miles} miles`]
    : [];

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                {displayData.name}
              </h1>
              {displayData.verified ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : hasPendingClaim ? (
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 text-[10px] uppercase font-bold px-2 py-0">
                  Verification Pending
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 text-[10px] uppercase font-bold px-2 py-0">
                  Unverified Profile
                </Badge>
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
              {dbListing?.id && (
                <BadgeDisplay listingId={dbListing.id} size="lg" maxDisplay={5} />
              )}
            </div>
          </div>
        </div>

        {!displayData.verified && (
          hasPendingClaim ? (
            <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-full">
                  <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ownership Verification In Progress</h3>
                  <p className="text-sm text-muted-foreground">A claim for this business is currently being reviewed by our command team.</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mb-8 border-primary/30 bg-primary/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Is this your business?</h3>
                  <p className="text-sm text-muted-foreground">Verify this profile to manage your fleet, respond to reviews, and unlock premium features.</p>
                </div>
              </div>
              <Link to={`/claim/${slug}`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
                  Claim this Marketplace Listing
                </Button>
              </Link>
            </Card>
          )
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fleet Units / Services */}
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Fleet Units
              </h2>
              {displayServices.length > 0 ? (
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
                        <div className="flex gap-4 flex-1">
                          {service.thumbnail ? (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                              <img
                                src={service.thumbnail}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                              <Package className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
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
                              {service.towCapacity && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground/70">
                                  <Weight className="h-3 w-3" />
                                  {service.towCapacity} lbs
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground font-medium italic">
                    {dbListing.claimed
                      ? "This vendor hasn't listed any units yet."
                      : "Fleet inventory pending verification"}
                  </p>
                </div>
              )}
            </Card>

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

            {dbListing?.id && (
              <BusinessReviews
                businessId={dbListing.id}
                placeId={dbListing.place_id}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {displayHours.length > 0 && (
                <Card className="p-6 bg-card">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Hours of Operation
                  </h2>
                  <div className="space-y-2">
                    {displayHours.map((hour, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b border-border last:border-0 text-sm"
                      >
                        <span className="font-medium text-foreground">{hour.day}</span>
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

              <Card className="p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Rental Inquiry
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Interested in this rental? Request a quote to check availability and get pricing directly from our verified fleet operator.
                  </p>
                </div>

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
        businessName={`Verified ${displayData.category || 'Rental'} Fleet`}
        businessId={dbListing?.id || ''}
        services={displayServices}
        onLeadSubmitted={(data) => {
          trackFormSubmit('lead_form');
          setLeadSubmitter(data);
          if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
          reviewTimerRef.current = setTimeout(() => {
            setReviewModalOpen(true);
          }, 300000);
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
    </div>
  );
};

export default BusinessDetail;
