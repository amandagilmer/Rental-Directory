import { useState, useMemo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { StateBusinesses } from "@/components/StateBusinesses";
import { Footer } from "@/components/Footer";
import { AdvancedFilters, FilterState, defaultFilters } from "@/components/AdvancedFilters";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { calculateDistance } from "@/hooks/useGeolocation";
import { Loader2 } from "lucide-react";
import { TrailerChatbot } from "@/components/TrailerChatbot";

const Index = () => {
  const { businesses: dbBusinesses, loading } = useBusinessListings();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [radius, setRadius] = useState(25);
  const [isMapView, setIsMapView] = useState(false);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Safely get business count
  const businesses = useMemo(() => {
    return Array.isArray(dbBusinesses) ? dbBusinesses : [];
  }, [dbBusinesses]);

  // Calculate max price from all listings for slider
  const maxPrice = useMemo(() => {
    if (!businesses || businesses.length === 0) return 500;
    const items = businesses.filter(b => b && typeof b === 'object');
    if (items.length === 0) return 500;
    const prices = items
      .map(b => b.lowestDailyRate)
      .filter((p): p is number => p !== null && typeof p === 'number' && p > 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 50) * 50 : 500;
  }, [businesses]);

  // Get unique sub-categories
  const subCategories = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];
    const cats = new Set<string>();
    businesses.forEach(b => {
      if (b?.services && Array.isArray(b.services)) {
        b.services.forEach(s => {
          if (s?.subCategory) cats.add(s.subCategory);
        });
      }
    });
    return Array.from(cats).sort();
  }, [businesses]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (Array.isArray(filters.selectedBadges) && filters.selectedBadges.length > 0) count++;
    if (filters.subCategory !== 'all') count++;
    if (filters.availableOnly) count++;
    return count;
  }, [filters, maxPrice]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    return businesses.filter((business) => {
      if (!business) return false;

      // Category filter
      const matchesCategory = activeCategory === "all" ||
        (Array.isArray(business.allCategoryIds) && business.allCategoryIds.some(catId =>
          (catId && typeof catId === 'string' && (catId.includes(activeCategory) || activeCategory.includes(catId)))
        ));

      // Search filter
      const matchesSearch = searchQuery === "" ||
        (business.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (business.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (business.category?.toLowerCase().includes(searchQuery.toLowerCase()));

      // Business Name specific filter
      const matchesBusinessName = (filters.businessName || "") === "" ||
        (business.name?.toLowerCase().includes(filters.businessName.toLowerCase()));

      // Distance filter
      let matchesDistance = true;
      if (userLocation && business.latitude && business.longitude) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, business.latitude, business.longitude);
        matchesDistance = distance <= radius;
      }

      // Price filter
      if (business.lowestDailyRate !== null && typeof business.lowestDailyRate === 'number') {
        if (business.lowestDailyRate < filters.priceRange[0] || business.lowestDailyRate > filters.priceRange[1]) {
          return false;
        }
      }

      // Badge filter
      if (Array.isArray(filters.selectedBadges) && filters.selectedBadges.length > 0) {
        const hasBadge = filters.selectedBadges.some(badge =>
          Array.isArray(business.badges) && business.badges.includes(badge)
        );
        if (!hasBadge) return false;
      }

      // Sub-category filter
      if (filters.subCategory !== 'all') {
        const hasSubCategory = Array.isArray(business.services) && business.services.some(
          s => s.subCategory === filters.subCategory
        );
        if (!hasSubCategory) return false;
      }

      // Availability filter
      if (filters.availableOnly && !business.hasAvailableUnits) {
        return false;
      }

      // Map Bounds filter
      let matchesBounds = true;
      if (isMapView && mapBounds && business.latitude && business.longitude) {
        matchesBounds =
          business.latitude >= mapBounds.south &&
          business.latitude <= mapBounds.north &&
          business.longitude >= mapBounds.west &&
          business.longitude <= mapBounds.east;
      }

      return matchesCategory && matchesSearch && matchesDistance && matchesBounds && matchesBusinessName;
    });
  }, [activeCategory, searchQuery, userLocation, radius, businesses, filters, isMapView, mapBounds]);

  const sortedBusinesses = useMemo(() => {
    if (!Array.isArray(filteredBusinesses)) return [];
    const sorted = [...filteredBusinesses];

    switch (filters.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.lowestDailyRate ?? Infinity) - (b.lowestDailyRate ?? Infinity));
      case 'price-high':
        return sorted.sort((a, b) => (b.lowestDailyRate ?? 0) - (a.lowestDailyRate ?? 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'reviews':
        return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
      default:
        return sorted;
    }
  }, [filteredBusinesses, filters.sortBy]);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
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

        <div className="py-4 border-b">
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        <WhyChoose />

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading listings...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  maxPrice={maxPrice}
                  subCategories={subCategories}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {activeCategory === "all" ? "All Rental Businesses" : `${businesses?.find(b => b?.categoryId === activeCategory)?.category ?? activeCategory} Businesses`}
                </h2>
                <p className="text-muted-foreground">
                  {sortedBusinesses.length} {sortedBusinesses.length === 1 ? "business" : "businesses"} found
                  {userLocation && ` within ${radius} miles`}
                  {filters.sortBy !== 'relevance' && ` • Sorted by ${filters.sortBy?.replace('-', ' ')}`}
                </p>
              </div>

              {isMapView ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                  <div className="h-[600px] lg:sticky lg:top-24">
                    <BusinessMap
                      businesses={sortedBusinesses}
                      userLocation={userLocation}
                      className="h-full shadow-lg border border-border"
                      onBoundsChanged={setMapBounds}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 content-start">
                    {sortedBusinesses.map((business) => (
                      <BusinessCard key={business.id} {...business} listingId={business.id} />
                    ))}
                    {sortedBusinesses.length === 0 && (
                      <div className="col-span-full text-center py-20">
                        <p className="text-xl text-muted-foreground text-center">No businesses found.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBusinesses.map((business) => (
                      <BusinessCard key={business.id} {...business} listingId={business.id} />
                    ))}
                  </div>
                  {sortedBusinesses.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-xl text-muted-foreground">No businesses found.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
        <StateBusinesses businesses={businesses} />
        <Footer />
        <TrailerChatbot />
      </div>
    </APIProvider>
  );
};

export default Index;