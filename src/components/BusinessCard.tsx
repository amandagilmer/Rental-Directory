import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { useFavorites } from "@/hooks/useFavorites";
import { useEffect, useRef } from "react";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

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
  const { trackSearchImpression } = useInteractionTracking(listingId || null);
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    if (listingId && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      trackSearchImpression(listingId);
    }
  }, [listingId, trackSearchImpression]);

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-card to-card/95 relative">
      <Link to={`/business/${slug}`} className="block relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <button
        onClick={toggleFavorite}
        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all shadow-sm group/heart"
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
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border-primary/20">
                {category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md flex-shrink-0 ml-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-foreground">{rating}</span>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 line-clamp-2 text-sm italic">
          {description}
        </p>

        <div className="space-y-4">
          <div className="pt-4 border-t border-white/5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] font-display">Trust Profile</span>
                <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-black uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Active
                </div>
              </div>
              <div className="flex items-center justify-center min-h-[48px] pt-2">
                {listingId && (
                  <BadgeDisplay listingId={listingId} size="md" maxDisplay={6} />
                )}
              </div>
            </div>
          </div>

          <Link to={`/business/${slug}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 font-bold uppercase italic tracking-tighter">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
