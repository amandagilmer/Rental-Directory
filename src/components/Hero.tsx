import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-rental.jpg";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
  };

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Find Local Rental Businesses
        </h1>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Discover car rentals, equipment, event supplies, and more in your area
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              name="search"
              placeholder="Search for rental businesses..."
              className="pl-12 h-14 text-lg bg-white border-0 shadow-xl"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 bg-accent hover:bg-accent/90 text-white">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
};
