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
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-secondary">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-block bg-primary rounded px-4 py-2 mb-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary-foreground">
            Built for Blue-Collar America
          </span>
        </div>
        
        {/* Main headline with italic slant styling */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
          <span className="text-primary-foreground italic">FIND LOCAL</span>
          <br />
          <span className="text-muted italic">TRAILER RENTALS</span>
          <br />
          <span className="text-primary-foreground italic">NEAR YOU</span>
        </h1>
        
        <p className="text-lg md:text-xl text-secondary-foreground/80 mb-12 max-w-2xl mx-auto">
          From flatbeds to dump trailers, connect with trusted local hosts who understand hard work.
        </p>
        
        {/* Search Form */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                name="search"
                placeholder="Search for trailer rentals..."
                className="pl-12 h-14 text-lg bg-background border-0 shadow-xl text-foreground"
              />
            </div>
            <Select value={activeCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-14 bg-background border-0 shadow-xl text-foreground">
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
            <Button type="submit" size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl font-semibold">
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
              className="h-12 px-6 bg-background/90 hover:bg-background border-0 text-foreground gap-2 whitespace-nowrap shadow-lg"
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

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-secondary-foreground/70 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Verified Hosts
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Instant Quotes
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Local Providers
          </div>
        </div>
      </div>
    </section>
  );
};
