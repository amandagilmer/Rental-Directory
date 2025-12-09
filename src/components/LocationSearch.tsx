import { useState, useEffect, useRef } from "react";
import { MapPin, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lng: number; address: string } | null) => void;
  onRadiusChange: (radius: number) => void;
  radius: number;
}

interface PlacePrediction {
  place_id: string;
  description: string;
}

const radiusOptions = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
];

export const LocationSearch = ({ onLocationChange, onRadiusChange, radius }: LocationSearchProps) => {
  const [locationInput, setLocationInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

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

  const handleInputChange = (value: string) => {
    setLocationInput(value);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length === 0) {
      setSuggestions([]);
      onLocationChange(null);
      return;
    }

    // Debounce API calls
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
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="relative flex-1" ref={inputRef}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
        <Input
          type="text"
          value={locationInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="City, zip code, or address..."
          className="pl-10 pr-10 h-12 bg-card border-border"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-accent"
          title="Use my location"
        >
          <Locate className={`h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
        </Button>
        
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
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
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-sm flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{suggestion.description}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      <Select value={radius.toString()} onValueChange={(v) => onRadiusChange(parseInt(v))}>
        <SelectTrigger className="w-full sm:w-[140px] h-12 bg-card border-border">
          <SelectValue placeholder="Distance" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {radiusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
