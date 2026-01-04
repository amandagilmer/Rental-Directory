
import { useState, useCallback, useEffect, useRef } from 'react';
import { APIProvider, Map, Marker, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
    initialExact?: boolean;
    onLocationChange: (lat: number, lng: number, address: string, exact: boolean) => void;
    apiKey: string;
}

export const LocationPicker = ({
    initialLat = 40.7128, // Default NYC
    initialLng = -74.0060,
    initialAddress = '',
    initialExact = true,
    onLocationChange,
    apiKey
}: LocationPickerProps) => {
    const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
    const [address, setAddress] = useState(initialAddress);
    const [exact, setExact] = useState(initialExact);
    const [searching, setSearching] = useState(false);

    // Sync initial props to state if they change significantly
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition({ lat: initialLat, lng: initialLng });
        }
    }, [initialLat, initialLng]);

    // Handle marker drag end
    const onDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setPosition({ lat: newLat, lng: newLng });
            onLocationChange(newLat, newLng, address, exact);
        }
    }, [address, exact, onLocationChange]);

    // Handle address search (lightweight simulation of autocomplete for now)
    // In a full implementation, we'd use the Places Autocomplete Service here
    const handleSearch = async () => {
        if (!address) return;
        setSearching(true);

        // Simulate geocoding delay
        // Real implementation would use the Geocoding service from the API
        setTimeout(() => {
            setSearching(false);
            toast.info("Geocoding simulation: Location updated (normally would move map)");
        }, 1000);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Business Location</Label>
                <div className="flex gap-2">
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Type address..."
                        className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={searching} variant="secondary">
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border relative">
                <APIProvider apiKey={apiKey}>
                    <Map
                        defaultCenter={position}
                        defaultZoom={13}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        mapId={'bf51a910020fa25a'} // Dark mode style ID or generic
                    >
                        <Marker
                            position={position}
                            draggable={true}
                            onDragEnd={onDragEnd}
                        />
                    </Map>
                </APIProvider>

                {!exact && (
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none flex items-center justify-center z-10">
                        <div className="w-32 h-32 rounded-full border-2 border-blue-500 bg-blue-500/20 animate-pulse" />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-0.5">
                    <Label className="text-base">Show Exact Location</Label>
                    <p className="text-xs text-muted-foreground">
                        {exact
                            ? "Pin shows exact address to customers."
                            : "Location shown as approximate area (Good for home-based businesses)."}
                    </p>
                </div>
                <Switch
                    checked={exact}
                    onCheckedChange={(checked) => {
                        setExact(checked);
                        onLocationChange(position.lat, position.lng, address, checked);
                    }}
                />
            </div>
        </div>
    );
};
