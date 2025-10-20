import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star } from "lucide-react";

interface BusinessCardProps {
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
}

export const BusinessCard = ({
  name,
  category,
  description,
  address,
  phone,
  rating,
  image,
}: BusinessCardProps) => {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-card to-card/95">
      <div className="aspect-video overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-foreground">{rating}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>{phone}</span>
          </div>
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90">
          View Details
        </Button>
      </div>
    </Card>
  );
};
