import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

interface BusinessMapProps {
  businesses: MapBusiness[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export const BusinessMap = ({ businesses, userLocation, className = "" }: BusinessMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [40.7128, -74.0060]; // NYC as default

      mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Create marker cluster group
      // @ts-ignore - markerClusterGroup is added by leaflet.markercluster
      markersRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 50,
      });

      mapInstanceRef.current.addLayer(markersRef.current);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Add user location marker if available
    if (userLocation && mapInstanceRef.current) {
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `<div style="background-color: hsl(243, 75%, 58%); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("Your Location");
    }

    // Add business markers
    businesses.forEach((business) => {
      if (!business.latitude || !business.longitude || !markersRef.current) return;

      const marker = L.marker([business.latitude, business.longitude]);

      const stars = "★".repeat(Math.floor(business.rating)) + "☆".repeat(5 - Math.floor(business.rating));
      
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1a1a1a;">${business.name}</h3>
          <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${business.category}</p>
          <div style="color: #f59e0b; font-size: 12px; margin-bottom: 8px;">${stars} (${business.rating})</div>
          <a href="/business/${business.slug}" style="color: hsl(243, 75%, 58%); font-size: 12px; text-decoration: none; font-weight: 500;">View Details →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.addLayer(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current && markersRef.current.getLayers().length > 0 && mapInstanceRef.current) {
      const bounds = markersRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 11);
    }

    return () => {
      // Don't destroy map on cleanup to prevent re-initialization issues
    };
  }, [businesses, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};
