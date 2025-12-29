import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Phone,
  Mail,
  ChevronRight,
  Truck,
  DollarSign,
  Ruler,
  Weight,
  Calendar,
  Play,
  CheckCircle2,
  Package,
  Settings,
  Zap,
  MapPin,
} from "lucide-react";

interface UnitData {
  id: string;
  service_name: string;
  description: string | null;
  asset_class: string | null;
  sub_category: string | null;
  year_make_model: string | null;
  length_ft: string | null;
  dimensions: string | null;
  empty_weight: string | null;
  payload_capacity: string | null;
  axle_configuration: string | null;
  traction_type: string | null;
  hitch_connection: string | null;
  ball_size: string | null;
  electrical_plug: string | null;
  daily_rate: number | null;
  three_day_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  features: string[] | null;
  youtube_url: string | null;
  is_available: boolean;
  listing_id: string;
}

interface ServiceLocation {
  id: string;
  location_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_primary: boolean;
  pickup_available: boolean;
  dropoff_available: boolean;
  notes: string | null;
}

interface BusinessData {
  id: string;
  business_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface UnitPhoto {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
}

const UnitDetail = () => {
  const { slug, unitId } = useParams<{ slug: string; unitId: string }>();
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [photos, setPhotos] = useState<UnitPhoto[]>([]);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const hasTrackedView = useRef(false);

  const { trackUnitView, trackUnitInquiry, trackClickToCall, trackButtonClick } =
    useInteractionTracking(business?.id || null);

  useEffect(() => {
    const fetchUnitData = async () => {
      if (!slug || !unitId) return;

      // Find business by slug
      const { data: listings } = await supabase
        .from("business_listings")
        .select("*")
        .eq("is_published", true);

      const listing = listings?.find(
        (l) =>
          l.business_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") === slug
      );

      if (!listing) {
        setLoading(false);
        return;
      }

      setBusiness(listing as BusinessData);

      // Fetch unit data
      const { data: unitData } = await supabase
        .from("business_services")
        .select("*")
        .eq("id", unitId)
        .eq("listing_id", listing.id)
        .single();

      if (unitData) {
        setUnit(unitData as UnitData);

        // Fetch unit photos
        const { data: photoData } = await supabase
          .from("service_photos")
          .select("*")
          .eq("service_id", unitId)
          .order("display_order");

        if (photoData) {
          setPhotos(photoData as UnitPhoto[]);
        }

        // Fetch unit locations
        const { data: locationData } = await supabase
          .from("service_locations")
          .select("*")
          .eq("service_id", unitId)
          .order("is_primary", { ascending: false });

        if (locationData) {
          setLocations(locationData as ServiceLocation[]);
        }
      }

      setLoading(false);
    };

    fetchUnitData();
  }, [slug, unitId]);

  // Track unit view once when loaded
  useEffect(() => {
    if (unit?.id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackUnitView(unit.id);
    }
  }, [unit?.id, trackUnitView]);

  const getPhotoUrl = (photo: UnitPhoto) => {
    const { data } = supabase.storage
      .from("business-photos")
      .getPublicUrl(photo.storage_path);
    return data.publicUrl;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleContactClick = () => {
    trackUnitInquiry(unit?.id || "");
    setLeadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!unit || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Unit Not Found
          </h1>
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

  const displayPhotos = photos.length > 0 ? photos.map(getPhotoUrl) : [];
  const youtubeEmbedUrl = unit.youtube_url
    ? getYouTubeEmbedUrl(unit.youtube_url)
    : null;

  // Build specs array for display
  const combatSpecs = [
    { label: "Year / Make / Model", value: unit.year_make_model, icon: Calendar },
    { label: "Length", value: unit.length_ft ? `${unit.length_ft} ft` : null, icon: Ruler },
    { label: "Dimensions", value: unit.dimensions, icon: Package },
    { label: "Empty Weight", value: unit.empty_weight, icon: Weight },
    { label: "Payload Capacity", value: unit.payload_capacity, icon: Truck },
    { label: "Axle Configuration", value: unit.axle_configuration, icon: Settings },
    { label: "Traction Type", value: unit.traction_type, icon: Zap },
    { label: "Hitch Connection", value: unit.hitch_connection, icon: Settings },
    { label: "Ball Size", value: unit.ball_size, icon: Settings },
    { label: "Electrical Plug", value: unit.electrical_plug, icon: Zap },
  ].filter((spec) => spec.value);

  const missionRates = [
    { label: "Daily Rate", value: unit.daily_rate, period: "/ day" },
    { label: "3-Day Rate", value: unit.three_day_rate, period: "/ 3 days" },
    { label: "Weekly Rate", value: unit.weekly_rate, period: "/ week" },
    { label: "Monthly Rate", value: unit.monthly_rate, period: "/ month" },
  ].filter((rate) => rate.value);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Directory
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              to={`/business/${slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {business.business_name}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{unit.service_name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section with Gallery */}
            <Card className="overflow-hidden bg-card">
              {/* Main Photo/Video Display */}
              <div className="relative aspect-video bg-muted">
                {displayPhotos.length > 0 ? (
                  <img
                    src={displayPhotos[activePhotoIndex]}
                    alt={unit.service_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Truck className="h-24 w-24 text-muted-foreground/50" />
                  </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant={unit.is_available ? "default" : "secondary"}
                    className={
                      unit.is_available
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-destructive"
                    }
                  >
                    {unit.is_available ? "Available" : "Currently Rented"}
                  </Badge>
                </div>
              </div>

              {/* Photo Thumbnails */}
              {displayPhotos.length > 1 && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2 overflow-x-auto">
                    {displayPhotos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          activePhotoIndex === index
                            ? "border-primary"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${unit.service_name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Unit Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {unit.asset_class && (
                  <Badge variant="outline" className="text-primary border-primary">
                    {unit.asset_class}
                  </Badge>
                )}
                {unit.sub_category && (
                  <Badge variant="secondary">{unit.sub_category}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {unit.service_name}
              </h1>
              {unit.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {unit.description}
                </p>
              )}
            </div>

            {/* YouTube Video */}
            {youtubeEmbedUrl && (
              <Card className="overflow-hidden bg-card">
                <div className="p-4 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Video Tour
                  </h2>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${unit.service_name} Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </Card>
            )}

            {/* Combat Specifications */}
            {combatSpecs.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Combat Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {combatSpecs.map((spec, index) => {
                    const Icon = spec.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {spec.label}
                          </p>
                          <p className="font-semibold text-foreground">
                            {spec.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Tactical Features */}
            {unit.features && unit.features.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Tactical Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unit.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Pickup/Dropoff Locations */}
            {locations.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Pickup & Dropoff Locations
                </h2>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-4 rounded-lg border ${
                        location.is_primary
                          ? "bg-primary/10 border-primary/30"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              location.is_primary ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {location.location_name}
                              </span>
                              {location.is_primary && (
                                <Badge variant="default" className="text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {(location.address || location.city) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {[
                                  location.address,
                                  location.city,
                                  location.state,
                                  location.zip_code,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {location.pickup_available && (
                                <Badge variant="outline" className="text-xs">
                                  Pickup Available
                                </Badge>
                              )}
                              {location.dropoff_available && (
                                <Badge variant="outline" className="text-xs">
                                  Dropoff Available
                                </Badge>
                              )}
                            </div>
                            {location.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {location.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Mission Rates Card */}
              {missionRates.length > 0 && (
                <Card className="p-6 bg-card border-2 border-primary/20">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Mission Rates
                  </h2>
                  <div className="space-y-3">
                    {missionRates.map((rate, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground">{rate.label}</span>
                        <div className="text-right">
                          <span className="text-xl font-bold text-primary">
                            ${rate.value?.toFixed(0)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            {rate.period}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Contact CTA Card */}
              <Card className="p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Reserve This Unit
                </h2>
                <div className="space-y-3">
                  <Button
                    onClick={handleContactClick}
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Contact to Reserve
                  </Button>

                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      onClick={() => trackClickToCall()}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full" size="lg">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </Button>
                    </a>
                  )}
                </div>

                {/* Operator Info */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Operated by
                  </p>
                  <Link
                    to={`/business/${slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {business.business_name}
                  </Link>
                  {business.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {business.address}
                    </p>
                  )}
                </div>
              </Card>

              {/* Back Link */}
              <Link to={`/business/${slug}`}>
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  View All Fleet Units
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        businessName={business.business_name}
        businessId={business.id}
        serviceName={unit.service_name}
        onSuccess={() => {
          trackButtonClick("lead_form_submit");
        }}
      />
    </div>
  );
};

export default UnitDetail;
