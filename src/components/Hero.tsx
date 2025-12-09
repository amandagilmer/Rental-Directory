import { Search, Map, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/LocationSearch";
import { categories } from "@/components/CategoryFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImage from "@/assets/hero-rental.jpg";

interface HeroProps {
  onSearch: (query: string) => void;
  onLocationChange: (location: { lat: number; lng: number; address: string } | null) => void;
  onRadiusChange: (radius: number) => void;
  radius: number;
  isMapView: boolean;
  onToggleMapView: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Hero = ({ 
  onSearch, 
  onLocationChange, 
  onRadiusChange, 
  radius,
  isMapView,
  onToggleMapView,
  activeCategory,
  onCategoryChange
}: HeroProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
  };

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Find Local Rental Businesses
        </h1>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Discover car rentals, equipment, event supplies, and more in your area
        </p>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                name="search"
                placeholder="Search for rental businesses..."
                className="pl-12 h-14 text-lg bg-white border-0 shadow-xl"
              />
            </div>
            <Select value={activeCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-14 bg-white border-0 shadow-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="h-14 px-8 bg-accent hover:bg-accent/90 text-white">
              Search
            </Button>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full">
              <LocationSearch
                onLocationChange={onLocationChange}
                onRadiusChange={onRadiusChange}
                radius={radius}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onToggleMapView}
              className="h-12 px-6 bg-white/90 hover:bg-white border-0 text-foreground gap-2 whitespace-nowrap"
            >
              {isMapView ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <Map className="h-4 w-4" />
                  Map View
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
