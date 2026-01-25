
import { useEffect, useState, useRef } from "react";
import { Map, AdvancedMarker, Pin, InfoWindow, useMap, MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { Link } from "react-router-dom";

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
}

interface BusinessMapProps {
  businesses: MapBusiness[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;
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

export const BusinessMap = ({ businesses, userLocation, className = "", onBoundsChanged }: BusinessMapProps) => {
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(null);
  const map = useMap();
  const defaultCenter = { lat: 31.9686, lng: -99.9018 }; // Center of Texas

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

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    if (onBoundsChanged) {
      onBoundsChanged(ev.detail.bounds);
    }
  };

  return (
    <div className={`w-full h-full min-h-[400px] rounded-lg overflow-hidden ${className}`}>
      <Map
        defaultCenter={userLocation || defaultCenter}
        defaultZoom={userLocation ? 10 : 6}
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
              <Circle
                key={business.id}
                radius={2000} // 2km radius
                center={position}
                strokeColor={"#F59E0B"}
                strokeOpacity={0.8}
                strokeWeight={2}
                fillColor={"#F59E0B"}
                fillOpacity={0.35}
                onClick={() => setSelectedBusiness(business)}
              />
            );
          }

          // Price Pill Marker
          return (
            <AdvancedMarker
              key={business.id}
              position={position}
              onClick={() => setSelectedBusiness(business)}
              zIndex={isSelected ? 50 : 1}
            >
              <div
                className={`
                  px-2.5 py-1 rounded-full shadow-sm border transition-all duration-200 cursor-pointer text-xs font-bold
                  ${isSelected
                    ? "bg-black text-white border-black scale-110"
                    : "bg-white text-gray-900 border-gray-200 hover:scale-110 hover:shadow-md hover:z-10"
                  }
                `}
              >
                {business.lowestDailyRate ? `$${business.lowestDailyRate}` : "$"}
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
