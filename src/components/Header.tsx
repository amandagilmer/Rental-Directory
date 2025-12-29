import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Find a Rental", href: "/" },
  { name: "Operator Badges", href: "/badges" },
  { name: "Command Center", href: "/dashboard" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Red accent bar */}
      <div className="h-1 bg-primary" />
      
      <nav className="bg-secondary" aria-label="Global">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
                  <span className="font-display font-bold text-lg text-primary-foreground">PH</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-display font-bold text-xl tracking-wide text-primary-foreground">
                    Patriot Hauls
                  </span>
                  <p className="text-xs text-secondary-foreground/70 uppercase tracking-widest -mt-0.5">
                    Hauling the Heart of America
                  </p>
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary-foreground",
                    isActive(item.href)
                      ? "text-primary-foreground"
                      : "text-secondary-foreground/80"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-semibold uppercase tracking-wide px-6">
                <Link to="/auth?mode=signup">List Your Trailer</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-secondary-foreground/20">
            <div className="container mx-auto px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-semibold uppercase tracking-wide transition-colors",
                    isActive(item.href)
                      ? "bg-primary/20 text-primary-foreground"
                      : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-primary-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 font-semibold uppercase tracking-wide">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    List Your Trailer
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
