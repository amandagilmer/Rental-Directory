import { useParams, Link } from "react-router-dom";
import { getBusinessBySlug } from "@/data/businesses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PhotoGallery } from "@/components/PhotoGallery";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { Footer } from "@/components/Footer";
import { useState } from "react";
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

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const business = getBusinessBySlug(slug || "");
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  if (!business) {
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
          src={business.image}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-card">
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {business.name}
              </h1>
              {business.verified && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(business.rating)}
                <span className="ml-1 text-foreground font-semibold">
                  {business.rating}
                </span>
              </div>
              <Badge variant="secondary">{business.category}</Badge>
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
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {business.fullDescription || business.description}
              </p>
            </Card>

            {/* Photo Gallery */}
            {business.photos && business.photos.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">Photos</h2>
                <PhotoGallery photos={business.photos} businessName={business.name} />
              </Card>
            )}

            {/* Hours of Operation */}
            {business.hours && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Hours of Operation
                </h2>
                <div className="space-y-2">
                  {business.hours.map((hour, index) => (
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
            {business.serviceArea && business.serviceArea.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Service Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {business.serviceArea.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Services & Pricing
                </h2>
                <div className="space-y-4">
                  {business.services.map((service, index) => (
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

            {/* Reviews */}
            {business.reviews && business.reviews.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Customer Reviews
                </h2>
                <div className="space-y-6">
                  {business.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">
                          {review.reviewerName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-accent text-accent"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
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
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{business.phone}</span>
                  </a>

                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="truncate">{business.email}</span>
                    </a>
                  )}

                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="truncate">Visit Website</span>
                    </a>
                  )}

                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{business.address}</span>
                  </div>
                </div>

                {/* Social Links */}
                {business.socialLinks && Object.keys(business.socialLinks).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Follow Us
                    </h3>
                    <div className="flex gap-2">
                      {Object.entries(business.socialLinks).map(([platform, url]) => {
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
        businessName={business.name}
        businessId={business.slug}
        services={business.services}
      />
    </div>
  );
};

export default BusinessDetail;
