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

  return (
    <div className="bg-card py-6 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {/* All Rentals button */}
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="lg"
            onClick={() => onCategoryChange("all")}
            className="gap-2"
          >
            All Rentals
          </Button>
          
          {/* Dynamic category buttons */}
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Folder;
            const isActive = activeCategory === category.slug;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="lg"
                onClick={() => onCategoryChange(category.slug)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name.replace(' Rental', '')}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export categories for use in Hero dropdown
export { useCategories };
