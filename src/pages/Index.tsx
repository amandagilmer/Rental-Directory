import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { businesses } from "@/data/businesses";
import { calculateDistance } from "@/hooks/useGeolocation";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [radius, setRadius] = useState(25);
  const [isMapView, setIsMapView] = useState(false);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesCategory = activeCategory === "all" || business.categoryId === activeCategory;
      const matchesSearch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by distance if user location is set
      let matchesDistance = true;
      if (userLocation && business.latitude && business.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.latitude,
          business.longitude
        );
        matchesDistance = distance <= radius;
      }
      
      return matchesCategory && matchesSearch && matchesDistance;
    });
  }, [activeCategory, searchQuery, userLocation, radius]);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-20">
        <Link to="/auth">
          <Button variant="outline" className="gap-2 bg-background/80 backdrop-blur-sm">
            <LogIn className="h-4 w-4" />
            Business Login
          </Button>
        </Link>
      </div>
      
      <Hero 
        onSearch={setSearchQuery}
        onLocationChange={setUserLocation}
        onRadiusChange={setRadius}
        radius={radius}
        isMapView={isMapView}
        onToggleMapView={() => setIsMapView(!isMapView)}
      />
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeCategory === "all" ? "All Rental Businesses" : `${businesses.find(b => b.categoryId === activeCategory)?.category} Businesses`}
          </h2>
          <p className="text-muted-foreground">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"} found
            {userLocation && ` within ${radius} miles`}
          </p>
        </div>
        
        {isMapView ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
            <div className="h-[600px] lg:sticky lg:top-4">
              <BusinessMap 
                businesses={filteredBusinesses} 
                userLocation={userLocation}
                className="h-full shadow-lg border border-border"
              />
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} {...business} />
              ))}
              {filteredBusinesses.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    No businesses found. Try a different search, category, or expand your search radius.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} {...business} />
              ))}
            </div>
            
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  No businesses found. Try a different search, category, or expand your search radius.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-card border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Local Rental Directory. Find the best rental businesses in your area.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
