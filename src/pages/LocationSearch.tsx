import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessMap } from "@/components/BusinessMap";
import { AdvancedFilters, FilterState, defaultFilters } from "@/components/AdvancedFilters";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { calculateDistance } from "@/hooks/useGeolocation";
import { Loader2, Map as MapIcon, List as ListIcon, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCenterForState } from "@/utils/stateCoordinates";
import { STATE_NAME_TO_ABBR } from "@/utils/stateMapping";

import { getStateSearchTerms } from "@/utils/stateMapping";

const LocationSearch = () => {
    const { state } = useParams<{ state?: string }>();
    const [searchParams] = useSearchParams();
    const { businesses: dbBusinesses, loading } = useBusinessListings();

    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isMapViewMobile, setIsMapViewMobile] = useState(false);
    const [mapBounds, setMapBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    // Safely get business count
    const businesses = useMemo(() => {
        return Array.isArray(dbBusinesses) ? dbBusinesses : [];
    }, [dbBusinesses]);

    // Calculate max price from all listings for slider
    const maxPrice = useMemo(() => {
        if (!businesses || businesses.length === 0) return 500;
        const prices = businesses
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

    const filteredBusinesses = useMemo(() => {
        if (!businesses) return [];

        const stateTerms = state ? getStateSearchTerms(state) : [];

        return businesses.filter((business) => {
            if (!business) return false;

            // State filter (from URL)
            if (state) {
                const targetAbbr = STATE_NAME_TO_ABBR[state.toLowerCase()];
                const businessState = business.state?.toUpperCase();

                // If we have a structured state, use it for exact matching
                if (businessState && targetAbbr) {
                    if (businessState !== targetAbbr) return false;
                } else if (stateTerms.length > 0) {
                    // Fallback to string matching for legacy listings
                    const businessAddress = business.address?.toLowerCase() || "";
                    const matchesState = stateTerms.some(term => businessAddress.includes(term));
                    if (!matchesState) return false;
                } else {
                    return false;
                }
            }

            // Category filter
            const matchesCategory = activeCategory === "all" ||
                (Array.isArray(business.allCategoryIds) && business.allCategoryIds.some(catId =>
                    (catId && typeof catId === 'string' && (catId.includes(activeCategory) || activeCategory.includes(catId)))
                ));

            // Search filter (text search)
            const matchesSearch = searchQuery === "" ||
                (business.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (business.description?.toLowerCase().includes(searchQuery.toLowerCase()));

            // Business Name specific filter (from advanced filters)
            const matchesBusinessName = (filters.businessName || "") === "" ||
                (business.name?.toLowerCase().includes(filters.businessName.toLowerCase()));

            // Combine category and text searches
            if (!(matchesCategory && matchesSearch && matchesBusinessName)) return false;

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

            return true;
        });
    }, [state, activeCategory, searchQuery, businesses, filters]);

    const sortedBusinesses = useMemo(() => {
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

    // Title formatting
    const displayState = state ? state.charAt(0).toUpperCase() + state.slice(1) : "All";
    const pageTitle = state ? `${displayState} Equipment & Trailer Rentals` : "Search Local Rentals";

    const stateCenter = useMemo(() => getCenterForState(state), [state]);

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="flex flex-col h-screen bg-background overflow-hidden">
                <Header />

                {/* Sub-header / Filter Bar */}
                <div className="bg-background border-b z-30 px-4 py-3">
                    <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-hidden">
                            <Link to="/" className="hover:text-primary flex items-center gap-1">
                                <Home className="w-3.5 h-3.5" /> Home
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                            <Link to="/locations" className="hover:text-primary">Locations</Link>
                            {state && (
                                <>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                    <span className="text-foreground font-medium truncate">{displayState}</span>
                                </>
                            )}
                        </nav>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setIsMapViewMobile(!isMapViewMobile)}
                            >
                                {isMapViewMobile ? (
                                    <><ListIcon className="w-4 h-4 mr-2" /> Show List</>
                                ) : (
                                    <><MapIcon className="w-4 h-4 mr-2" /> Show Map</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="container mx-auto mt-3">
                        <AdvancedFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            maxPrice={maxPrice}
                            subCategories={subCategories}
                            activeFiltersCount={0} // We could calculate this like in Index.tsx
                        />
                    </div>
                </div>

                {/* Main Content Area - Split View */}
                <div className="flex-1 flex overflow-hidden relative">

                    {/* Left Column: Listings */}
                    <div className={`
            flex-1 md:w-1/2 lg:w-[45%] h-full overflow-y-auto custom-scrollbar bg-gray-50/50
            ${isMapViewMobile ? 'hidden md:block' : 'block'}
          `}>
                        <div className="p-4 md:p-6 max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 font-display uppercase tracking-tight">
                                    {pageTitle}
                                </h1>
                                <p className="text-muted-foreground font-medium">
                                    {sortedBusinesses.length} {sortedBusinesses.length === 1 ? "business" : "businesses"} found
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
                                {sortedBusinesses.map((business) => (
                                    <BusinessCard key={business.id} {...business} listingId={business.id} />
                                ))}
                                {sortedBusinesses.length === 0 && !loading && (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-xl text-muted-foreground">No businesses found in this area.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setFilters(defaultFilters)}
                                            className="mt-2"
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                )}
                                {loading && (
                                    <div className="col-span-full py-20 flex justify-center items-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                                        <span className="text-muted-foreground">Loading listings...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Map */}
                    <div className={`
            flex-1 md:w-1/2 lg:w-[55%] h-full relative border-l border-border
            ${isMapViewMobile ? 'block' : 'hidden md:block'}
          `}>
                        <BusinessMap
                            businesses={sortedBusinesses}
                            className="w-full h-full"
                            onBoundsChanged={setMapBounds}
                            center={stateCenter}
                            zoom={stateCenter?.zoom}
                        />

                    </div>
                </div>

                {/* Footer hidden or simplified for this view to maximize screen space */}
            </div>
        </APIProvider>
    );
};

export default LocationSearch;
