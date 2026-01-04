import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Heart } from "lucide-react";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { useFavorites } from "@/hooks/useFavorites";

interface BusinessCardProps {
  slug: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
  listingId?: string;
}

export const BusinessCard = ({
  slug,
  name,
  category,
  description,
  address,
  phone,
  rating,
  image,
  listingId,
}: BusinessCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites(listingId);

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-card to-card/95">
      <Link to={`/business/${slug}`} className="block relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges overlay */}
          {listingId && (
            <div className="absolute top-2 left-2">
              <BadgeDisplay listingId={listingId} size="sm" maxDisplay={3} />
            </div>
          )}
        </div>
      </Link>

      {/* Favorite Button - Outside Link to avoid nesting issues, positioned absolutely over the card image via negative margin or by making card relative? 
          Actually, simpler to put it absolute inside a relative wrapper around the imageLink. 
          The Link above wraps the div. Let's put the button sibling to Link but absolutely positioned.
       */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all shadow-sm group/heart"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${isFavorite
            ? "fill-red-500 text-red-500"
            : "text-gray-600 group-hover/heart:text-red-500"
            }`}
        />
      </button>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link to={`/business/${slug}`}>
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors cursor-pointer truncate">
                {name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {listingId && (
                <BadgeDisplay listingId={listingId} size="sm" maxDisplay={2} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md flex-shrink-0 ml-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-foreground">{rating}</span>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Contact Info Hidden for Lead Model
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <span>{phone}</span>
          </div>
        </div>
        */}
        <div className="mb-4">
          {/* Spacer or substitute content could go here if needed, 
               e.g. "Verified Operator" badge or response time indicator 
           */}
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Active Responder
          </div>
        </div>

        <Link to={`/business/${slug}`}>
          <Button className="w-full bg-primary hover:bg-primary/90">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};
