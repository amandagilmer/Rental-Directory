import { Search, MapPin, Map, List, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

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

interface PlacePrediction {
  place_id: string;
  description: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const fetchSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('places-autocomplete', {
        body: { input }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        return;
      }

      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length === 0) {
      setSuggestions([]);
      onLocationChange(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = async (suggestion: PlacePrediction) => {
    setLocationInput(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('places-geocode', {
        body: { placeId: suggestion.place_id }
      });

      if (error) {
        console.error('Error geocoding place:', error);
        return;
      }

      onLocationChange({
        lat: data.lat,
        lng: data.lng,
        address: data.address || suggestion.description
      });
    } catch (error) {
      console.error('Error geocoding place:', error);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInput("Current Location");
        onLocationChange({ lat: latitude, lng: longitude, address: "Current Location" });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please enter it manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-[550px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-secondary/85" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Badge */}
        <div className="inline-block bg-primary rounded px-4 py-1.5 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground">
            Built for Blue-Collar America
          </span>
        </div>
        
        {/* Main headline */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
          <span className="text-primary-foreground italic">FIND LOCAL</span>
          <br />
          <span className="text-muted italic">TRAILER RENTALS</span>
          <br />
          <span className="text-primary-foreground italic">NEAR YOU</span>
        </h1>
        
        <p className="text-base md:text-lg text-secondary-foreground/80 mb-10 max-w-xl mx-auto">
          From flatbeds to dump trailers, connect with trusted local hosts who understand hard work.
        </p>
        
        {/* Unified Search Bar */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-2xl border border-border/50">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need?"
                  className="pl-9 h-11 bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px bg-border/50 my-2" />
              
              {/* Location Input */}
              <div className="relative flex-1" ref={inputRef}>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  value={locationInput}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  placeholder="City, zip, or address"
                  className="pl-9 pr-9 h-11 bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent/50"
                  title="Use my location"
                >
                  <Locate className={`h-3.5 w-3.5 ${isLocating ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                </Button>
                
                {/* Location Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-48 overflow-auto">
                    {isLoading ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-2.5 text-left hover:bg-accent transition-colors text-sm flex items-center gap-2"
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-foreground">{suggestion.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <Button 
                type="submit" 
                className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Map/List Toggle */}
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleMapView}
            className="text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10 gap-2 text-sm"
          >
            {isMapView ? (
              <>
                <List className="h-4 w-4" />
                Switch to List View
              </>
            ) : (
              <>
                <Map className="h-4 w-4" />
                Switch to Map View
              </>
            )}
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-secondary-foreground/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Verified Hosts
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Instant Quotes
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Local Providers
          </div>
        </div>
      </div>
    </section>
  );
};
