import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { Footer } from "@/components/Footer";
import { AdvancedFilters, FilterState, defaultFilters, SortOption } from "@/components/AdvancedFilters";
import { useBusinessListings, BusinessListing } from "@/hooks/useBusinessListings";
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
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Use database listings if available, otherwise fall back to mock data
  const businesses = dbBusinesses.length > 0 ? dbBusinesses : mockBusinesses;

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
  const isDbListing = (b: any): b is BusinessListing => {
    return 'badges' in b && 'services' in b;
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      // Category filter
      const matchesCategory = activeCategory === "all" || business.categoryId === activeCategory;
      
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

      // Advanced filters only apply to database listings
      if (isDbListing(business)) {
        // Price range filter
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
      }
      
      return matchesCategory && matchesSearch && matchesDistance;
    });
  }, [activeCategory, searchQuery, userLocation, radius, businesses, filters]);

  // Sort filtered businesses
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses];
    
    switch (filters.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = isDbListing(a) ? (a.lowestDailyRate ?? Infinity) : Infinity;
          const priceB = isDbListing(b) ? (b.lowestDailyRate ?? Infinity) : Infinity;
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = isDbListing(a) ? (a.lowestDailyRate ?? 0) : 0;
          const priceB = isDbListing(b) ? (b.lowestDailyRate ?? 0) : 0;
          return priceB - priceA;
        });
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return sorted.sort((a, b) => {
          const reviewsA = isDbListing(a) ? a.reviewCount : 0;
          const reviewsB = isDbListing(b) ? b.reviewCount : 0;
          return reviewsB - reviewsA;
        });
      default:
        return sorted;
    }
  }, [filteredBusinesses, filters.sortBy]);

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
                <div className="h-[600px] lg:sticky lg:top-4">
                  <BusinessMap 
                    businesses={sortedBusinesses} 
                    userLocation={userLocation}
                    className="h-full shadow-lg border border-border"
                  />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {sortedBusinesses.map((business) => (
                    <BusinessCard key={business.id} {...business} listingId={business.id} />
                  ))}
                  {sortedBusinesses.length === 0 && (
                    <div className="text-center py-20">
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
    </div>
  );
};

export default Index;