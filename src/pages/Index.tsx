import { useState, useMemo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { Footer } from "@/components/Footer";
import { AdvancedFilters, FilterState, defaultFilters, SortOption } from "@/components/AdvancedFilters";
import { useBusinessListings, BusinessListing } from "@/hooks/useBusinessListings";
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

  // Use database listings only
  const businesses = dbBusinesses;

  // Calculate max price from all listings for slider
  const maxPrice = useMemo(() => {
    if (dbBusinesses.length === 0) return 500;
    const prices = dbBusinesses
      .map(b => b.lowestDailyRate)
      .filter((p): p is number => p !== null && p > 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 50) * 50 : 500;
  }, [dbBusinesses]);

  // Get unique sub-categories
  const subCategories = useMemo(() => {
    if (dbBusinesses.length === 0) return [];
    const cats = new Set<string>();
    dbBusinesses.forEach(b => {
      b.services.forEach(s => {
        if (s.subCategory) cats.add(s.subCategory);
      });
    });
    return Array.from(cats).sort();
  }, [dbBusinesses]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.selectedBadges.length > 0) count++;
    if (filters.subCategory !== 'all') count++;
    if (filters.availableOnly) count++;
    return count;
  }, [filters, maxPrice]);

  // Helper to check if a listing is from database (has extended properties)
  // const isDbListing = (b: any): b is BusinessListing => {
  //   return 'badges' in b && 'services' in b;
  // };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      // Category filter - check primary and additional categories
      const matchesCategory = activeCategory === "all" ||
        business.allCategoryIds.some(catId => catId.includes(activeCategory) || activeCategory.includes(catId));

      // Search filter
      const matchesSearch = searchQuery === "" ||
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Distance filter
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

      // Advanced filters
      if (business.lowestDailyRate !== null) {
        if (business.lowestDailyRate < filters.priceRange[0] ||
          business.lowestDailyRate > filters.priceRange[1]) {
          return false;
        }
      }

      // Badge filter
      if (filters.selectedBadges.length > 0) {
        const hasBadge = filters.selectedBadges.some(badge =>
          business.badges.includes(badge)
        );
        if (!hasBadge) return false;
      }

      // Sub-category filter
      if (filters.subCategory !== 'all') {
        const hasSubCategory = business.services.some(
          s => s.subCategory === filters.subCategory
        );
        if (!hasSubCategory) return false;
      }

      // Availability filter
      if (filters.availableOnly && !business.hasAvailableUnits) {
        return false;
      }

      // Map Bounds filter (only in Map View)
      let matchesBounds = true;
      if (isMapView && mapBounds && business.latitude && business.longitude) {
        matchesBounds =
          business.latitude >= mapBounds.south &&
          business.latitude <= mapBounds.north &&
          business.longitude >= mapBounds.west &&
          business.longitude <= mapBounds.east;
      }

      return matchesCategory && matchesSearch && matchesDistance && matchesBounds;
    });
  }, [activeCategory, searchQuery, userLocation, radius, businesses, filters, isMapView, mapBounds]);

  // Sort filtered businesses
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses];

    switch (filters.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = a.lowestDailyRate ?? Infinity;
          const priceB = b.lowestDailyRate ?? Infinity;
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = a.lowestDailyRate ?? 0;
          const priceB = b.lowestDailyRate ?? 0;
          return priceB - priceA;
        });
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return sorted.sort((a, b) => {
          const reviewsA = a.reviewCount;
          const reviewsB = b.reviewCount;
          return reviewsB - reviewsA;
        });
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

        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading listings...</span>
            </div>
          ) : (
            <>
              {/* Advanced Filters */}
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
                  {activeCategory === "all" ? "All Rental Businesses" : `${businesses.find(b => b.categoryId === activeCategory)?.category} Businesses`}
                </h2>
                <p className="text-muted-foreground">
                  {sortedBusinesses.length} {sortedBusinesses.length === 1 ? "business" : "businesses"} found
                  {userLocation && ` within ${radius} miles`}
                  {filters.sortBy !== 'relevance' && ` • Sorted by ${filters.sortBy.replace('-', ' ')}`}
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
                        <p className="text-xl text-muted-foreground">
                          No businesses found. Try adjusting your filters or search criteria.
                        </p>
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
                      <p className="text-xl text-muted-foreground">
                        No businesses found. Try adjusting your filters or search criteria.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        <Footer />

        {/* AI Trailer Recommendation Chatbot */}
        <TrailerChatbot />
      </div>
    </APIProvider>
  );
};

export default Index;