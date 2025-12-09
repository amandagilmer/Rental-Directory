import { Button } from "@/components/ui/button";
import { Car, Hammer, Calendar, Box, Bike, PartyPopper } from "lucide-react";

import { Truck, Caravan } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: null },
  { id: "trailer", label: "Trailer Rental", icon: Truck },
  { id: "rv", label: "RV Rental", icon: Caravan },
  { id: "camper", label: "Camper Rental", icon: Caravan },
  { id: "car", label: "Car Rental", icon: Car },
  { id: "equipment", label: "Equipment", icon: Hammer },
  { id: "event", label: "Event Supplies", icon: Calendar },
  { id: "storage", label: "Storage", icon: Box },
  { id: "bike", label: "Bikes & Scooters", icon: Bike },
  { id: "party", label: "Party Supplies", icon: PartyPopper },
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
