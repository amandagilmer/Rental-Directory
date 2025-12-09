import { useState, useEffect, useRef } from "react";
import { MapPin, Locate, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lng: number; address: string } | null) => void;
  onRadiusChange: (radius: number) => void;
  radius: number;
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // TODO: Replace with Google Places Autocomplete API for production
  // To integrate Google Places API:
  // 1. Add VITE_GOOGLE_PLACES_API_KEY to your .env file
  // 2. Load the Google Maps JavaScript API with places library
  // 3. Replace sampleLocations with google.maps.places.AutocompleteService
  // 4. Use PlacesService.getDetails() to get lat/lng from place_id
  // Documentation: https://developers.google.com/maps/documentation/javascript/places-autocomplete
  const sampleLocations = [
    "Downtown, 40.7128, -74.0060",
    "Midtown, 40.7549, -73.9840",
    "West Side, 40.7831, -73.9712",
    "East District, 40.7614, -73.9776",
    "Central Park Area, 40.7829, -73.9654",
    "Northside, 40.8448, -73.8648",
    "Airport Area, 40.6413, -73.7781",
  ];

  const handleInputChange = (value: string) => {
    setLocationInput(value);
    if (value.length > 0) {
      const filtered = sampleLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onLocationChange(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const parts = suggestion.split(", ");
    const address = parts[0];
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[2]);
    
    setLocationInput(address);
    setShowSuggestions(false);
    onLocationChange({ lat, lng, address });
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-sm flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {suggestion.split(", ")[0]}
              </button>
            ))}
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
