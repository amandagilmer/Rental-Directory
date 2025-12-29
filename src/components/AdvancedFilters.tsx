import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, SlidersHorizontal, X, DollarSign, ArrowUpDown, Shield, Tag, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'reviews';

export interface FilterState {
  priceRange: [number, number];
  sortBy: SortOption;
  selectedBadges: string[];
  subCategory: string;
  availableOnly: boolean;
}

interface BadgeDefinition {
  badge_key: string;
  name: string;
  icon: string;
  color: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  maxPrice: number;
  subCategories: string[];
  activeFiltersCount: number;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  maxPrice,
  subCategories,
  activeFiltersCount,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('badge_definitions')
        .select('badge_key, name, icon, color')
        .order('display_order');
      if (data) setBadges(data);
    };
    fetchBadges();
  }, []);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleSortChange = (value: SortOption) => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  const handleBadgeToggle = (badgeKey: string) => {
    const newBadges = filters.selectedBadges.includes(badgeKey)
      ? filters.selectedBadges.filter(b => b !== badgeKey)
      : [...filters.selectedBadges, badgeKey];
    onFiltersChange({ ...filters, selectedBadges: newBadges });
  };

  const handleSubCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, subCategory: value });
  };

  const handleAvailableOnlyChange = (checked: boolean) => {
    onFiltersChange({ ...filters, availableOnly: checked });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      sortBy: 'relevance',
      selectedBadges: [],
      subCategory: 'all',
      availableOnly: false,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-foreground hover:bg-accent"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-medium">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>

        <div className="flex items-center gap-3">
          {/* Sort dropdown - always visible */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expandable filters section */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <Label className="font-medium">Daily Price Range</Label>
              </div>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>

            {/* Sub-Category */}
            {subCategories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Equipment Type</Label>
                </div>
                <Select value={filters.subCategory} onValueChange={handleSubCategoryChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Types</SelectItem>
                    {subCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Availability Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <Label className="font-medium">Availability</Label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="available-only"
                  checked={filters.availableOnly}
                  onCheckedChange={handleAvailableOnlyChange}
                />
                <Label htmlFor="available-only" className="text-sm cursor-pointer">
                  Show available only
                </Label>
              </div>
            </div>

            {/* Badge Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label className="font-medium">Trust Badges</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 4).map((badge) => (
                  <div key={badge.badge_key} className="flex items-center gap-2">
                    <Checkbox
                      id={badge.badge_key}
                      checked={filters.selectedBadges.includes(badge.badge_key)}
                      onCheckedChange={() => handleBadgeToggle(badge.badge_key)}
                    />
                    <Label htmlFor={badge.badge_key} className="text-sm cursor-pointer">
                      {badge.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* More badges if available */}
          {badges.length > 4 && (
            <div className="pt-2 border-t border-border">
              <Label className="text-sm text-muted-foreground mb-2 block">More Badges</Label>
              <div className="flex flex-wrap gap-3">
                {badges.slice(4).map((badge) => (
                  <div key={badge.badge_key} className="flex items-center gap-2">
                    <Checkbox
                      id={badge.badge_key}
                      checked={filters.selectedBadges.includes(badge.badge_key)}
                      onCheckedChange={() => handleBadgeToggle(badge.badge_key)}
                    />
                    <Label htmlFor={badge.badge_key} className="text-sm cursor-pointer">
                      {badge.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const defaultFilters: FilterState = {
  priceRange: [0, 500],
  sortBy: 'relevance',
  selectedBadges: [],
  subCategory: 'all',
  availableOnly: false,
};