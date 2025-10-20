import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { businesses } from "@/data/businesses";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBusinesses = businesses.filter((business) => {
    const matchesCategory = activeCategory === "all" || business.categoryId === activeCategory;
    const matchesSearch = searchQuery === "" || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-10">
        <Link to="/auth">
          <Button variant="outline" className="gap-2">
            <LogIn className="h-4 w-4" />
            Business Login
          </Button>
        </Link>
      </div>
      
      <Hero onSearch={setSearchQuery} />
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeCategory === "all" ? "All Rental Businesses" : `${businesses.find(b => b.categoryId === activeCategory)?.category} Businesses`}
          </h2>
          <p className="text-muted-foreground">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"} found
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} {...business} />
          ))}
        </div>
        
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No businesses found. Try a different search or category.
            </p>
          </div>
        )}
      </main>
      
      <footer className="bg-card border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Local Rental Directory. Find the best rental businesses in your area.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
