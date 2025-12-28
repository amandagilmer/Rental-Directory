import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { Footer } from "@/components/Footer";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { businesses as mockBusinesses } from "@/data/businesses";
import { calculateDistance } from "@/hooks/useGeolocation";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { businesses: dbBusinesses, loading } = useBusinessListings();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [radius, setRadius] = useState(25);
  const [isMapView, setIsMapView] = useState(false);

  // Use database listings if available, otherwise fall back to mock data
  const businesses = dbBusinesses.length > 0 ? dbBusinesses : mockBusinesses;

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
  }, [activeCategory, searchQuery, userLocation, radius, businesses]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Hero
        onSearch={setSearchQuery}
        onLocationChange={setUserLocation}
        onRadiusChange={setRadius}
        radius={radius}
        isMapView={isMapView}
        onToggleMapView={() => setIsMapView(!isMapView)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading listings...</span>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
