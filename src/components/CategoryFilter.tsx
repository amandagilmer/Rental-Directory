import { Button } from "@/components/ui/button";
import { Truck, Caravan, Hammer, Container, Folder, Loader2 } from "lucide-react";
import { useCategories, Category } from "@/hooks/useCategories";

// Icon mapping from database icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  hammer: Hammer,
  caravan: Caravan,
  container: Container,
  folder: Folder,
};

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="bg-card py-6 border-b border-border">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Filter for specific categories requested by user
  const targetCategories = ['trailer', 'dumpster', 'equipment'];
  const displayedCategories = categories.filter(cat =>
    targetCategories.some(target => cat.name.toLowerCase().includes(target) || cat.slug.toLowerCase().includes(target))
  );

  return (
    <div className="bg-background py-10 border-b border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center font-display uppercase tracking-wide">Select Your Rental Type</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {/* All Rentals Tile */}
          <button
            onClick={() => onCategoryChange("all")}
            className={`
              relative w-48 h-36 rounded-xl overflow-hidden transition-all duration-300 shadow-sm
              ${activeCategory === "all"
                ? "ring-4 ring-red-600 ring-offset-2 scale-105 shadow-xl"
                : "hover:scale-105 hover:shadow-lg opacity-90 hover:opacity-100"
              }
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] to-gray-900" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-2 border-white/5">
              <span className="font-display font-bold text-white text-xl uppercase tracking-wider">All Rentals</span>
            </div>
          </button>

          {/* Dynamic Category Tiles */}
          {displayedCategories.map((category) => {
            const isActive = activeCategory === category.slug;
            const Icon = iconMap[category.icon] || Folder;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={`
                  relative w-48 h-36 rounded-xl overflow-hidden transition-all duration-300 group shadow-sm
                  ${isActive
                    ? "ring-4 ring-red-600 ring-offset-2 scale-105 shadow-xl"
                    : "hover:scale-105 hover:shadow-lg"
                  }
                `}
              >
                {/* Background Image or Fallback */}
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0A0F1C] flex items-center justify-center">
                    <Icon className="h-12 w-12 text-gray-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${isActive ? 'opacity-90' : 'opacity-80 group-hover:opacity-90'}`} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <span className="font-display font-bold text-white text-lg uppercase tracking-wider leading-none block shadow-black drop-shadow-md">
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export categories for use in Hero dropdown
export { useCategories };
