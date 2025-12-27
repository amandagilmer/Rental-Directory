import { Button } from "@/components/ui/button";
import { Truck, Caravan, Hammer, Container } from "lucide-react";

const categories = [
  { id: "all", label: "All Rentals", icon: null },
  { id: "trailer", label: "Trailers", icon: Truck },
  { id: "equipment", label: "Equipment", icon: Hammer },
  { id: "rv", label: "RVs & Campers", icon: Caravan },
  { id: "storage", label: "Storage", icon: Container },
];

// Export categories for use in Hero dropdown
export { categories };

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="bg-card py-6 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="lg"
                onClick={() => onCategoryChange(category.id)}
                className="gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
