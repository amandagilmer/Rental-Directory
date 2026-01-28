
import { useEffect, useState, useRef } from "react";
import { Map, AdvancedMarker, Pin, InfoWindow, useMap, MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

interface MapBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  rating: number;
  latitude?: number;
  longitude?: number;
  show_exact_location?: boolean;
  lowestDailyRate?: number | null;
  image?: string;
}

interface BusinessMapProps {
  businesses: MapBusiness[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Custom Circle Component
function Circle(props: google.maps.CircleOptions & { onClick?: () => void }) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    circleRef.current = new google.maps.Circle(props);
    circleRef.current.setMap(map);

    if (props.onClick) {
      circleRef.current.addListener("click", props.onClick);
    }

    return () => {
      circleRef.current?.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setOptions(props);
    }
  }, [props]);

  return null;
}

export const BusinessMap = ({ businesses, userLocation, className = "", onBoundsChanged, center, zoom }: BusinessMapProps) => {
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(null);
  const map = useMap();
  const lastCenterProcessed = useRef<string | null>(null);

  // Pan and Zoom to selected business
  useEffect(() => {
    if (map && selectedBusiness && selectedBusiness.latitude && selectedBusiness.longitude) {
      map.panTo({ lat: selectedBusiness.latitude, lng: selectedBusiness.longitude });
      // If we're zoomed out too far, zoom in for a better view
      if (map.getZoom()! < 12) {
        map.setZoom(12);
      }
    }
  }, [map, selectedBusiness]);
  const defaultCenter = { lat: 31.9686, lng: -99.9018 }; // Center of Texas
  const activeCenter = center || userLocation || defaultCenter;
  const activeZoom = zoom || (userLocation ? 10 : 6);

  // Auto-center map when businesses change
  useEffect(() => {
    if (!map || businesses.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidPoints = false;

    businesses.forEach(b => {
      if (b.latitude && b.longitude) {
        bounds.extend({ lat: b.latitude, lng: b.longitude });
        hasValidPoints = true;
      }
    });

    if (hasValidPoints) {
      // Don't auto-fit if user interaction just happened (optional)
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      });

      // If only one business, cap the zoom
      if (businesses.length === 1) {
        const listener = map.addListener('idle', () => {
          if (map.getZoom()! > 12) map.setZoom(12);
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, businesses]);

  // Track the last center/zoom we positioned to
  const lastTarget = useRef<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Manual centering effect for state changes
  useEffect(() => {
    if (map && center) {
      // Check if this is a NEW target compared to what we last actively set
      const isNewTarget = !lastTarget.current ||
        lastTarget.current.lat !== center.lat ||
        lastTarget.current.lng !== center.lng ||
        lastTarget.current.zoom !== zoom;

      if (isNewTarget) {
        map.setCenter(center);
        if (typeof zoom === 'number') {
          map.setZoom(zoom);
        }
        // Save this as our current target
        lastTarget.current = { ...center, zoom };
      }
    }
  }, [map, center, zoom]);

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    if (onBoundsChanged) {
      onBoundsChanged(ev.detail.bounds);
    }
  };

  return (
    <div className={`w-full h-full min-h-[400px] rounded-lg overflow-hidden ${className}`}>
      <Map
        defaultCenter={activeCenter}
        defaultZoom={activeZoom}
        mapId="bf51a910020fa25a"
        disableDefaultUI={false}
        clickableIcons={false}
        onCameraChanged={handleCameraChange}
      >
        {/* User Location Marker */}
        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-pulse" />
          </AdvancedMarker>
        )}

        {/* Business Markers */}
        {businesses.map((business) => {
          if (!business.latitude || !business.longitude) return null;

          const position = { lat: business.latitude, lng: business.longitude };
          const isExact = business.show_exact_location !== false; // Default true
          const isSelected = selectedBusiness?.id === business.id;

          if (!isExact) {
            return (
              <div key={business.id}>
                <Circle
                  radius={2000} // 2km radius
                  center={position}
                  strokeColor={"#F59E0B"}
                  strokeOpacity={0.6}
                  strokeWeight={1}
                  fillColor={"#F59E0B"}
                  fillOpacity={0.2}
                  onClick={() => setSelectedBusiness(business)}
                />
                <AdvancedMarker
                  position={position}
                  onClick={() => setSelectedBusiness(business)}
                  zIndex={isSelected ? 50 : 1}
                >
                  <div className={`relative flex flex-col items-center group cursor-pointer transition-all duration-500 ${isSelected ? 'z-50' : 'z-10'}`}>
                    <div
                      className={`
                        w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 transition-all duration-500 transform
                        ${isSelected
                          ? "border-primary scale-125 ring-4 ring-primary/20 opacity-100"
                          : "border-amber-400/50 hover:border-primary hover:scale-110 opacity-70 hover:opacity-100 bg-white/50 backdrop-blur-sm"
                        }
                      `}
                    >
                      <img
                        src={business.image || "/placeholder.svg"}
                        alt={business.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              </div>
            );
          }

          // Premium Business Logo Marker
          return (
            <AdvancedMarker
              key={business.id}
              position={position}
              onClick={() => setSelectedBusiness(business)}
              zIndex={isSelected ? 50 : 1}
            >
              <div className={`relative flex flex-col items-center group cursor-pointer transition-all duration-500 ${isSelected ? 'z-50' : 'z-10'}`}>
                <div
                  className={`
                    w-12 h-12 rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-500 transform
                    ${isSelected
                      ? "border-primary scale-125 ring-8 ring-primary/10"
                      : "border-white hover:border-primary/50 hover:scale-110"
                    }
                  `}
                >
                  <img
                    src={business.image || "/placeholder.svg"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Visual indicator for location */}
                <div className={`
                  w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm border-2 transition-all duration-500
                  ${isSelected ? "bg-primary border-white scale-110" : "bg-white border-slate-400"}
                `} />

                {/* Name Label (Shown on hover/select) */}
                <div className={`
                    absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50
                `}>
                  {business.name}
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Info Window */}
        {selectedBusiness && selectedBusiness.latitude && selectedBusiness.longitude && (
          <InfoWindow
            position={{ lat: selectedBusiness.latitude, lng: selectedBusiness.longitude }}
            onCloseClick={() => setSelectedBusiness(null)}
            headerContent={<span className="font-bold text-sm">{selectedBusiness.name}</span>}
            pixelOffset={[0, -10]}
          >
            <div className="min-w-[200px] p-1">
              <p className="text-xs text-gray-600 mb-2">{selectedBusiness.category}</p>
              <div className="flex items-center gap-1 mb-2 text-yellow-500 text-xs">
                {"★".repeat(Math.round(selectedBusiness.rating))}
                <span className="text-gray-400">({selectedBusiness.rating})</span>
              </div>
              {!selectedBusiness.show_exact_location && (
                <p className="text-[10px] text-orange-600 mb-2 font-medium bg-orange-50 px-1 rounded">
                  Approximate Location
                </p>
              )}
              <Link
                to={`/business/${selectedBusiness.slug}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded transition-colors"
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};
