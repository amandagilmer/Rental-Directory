import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Directory", href: "/#directory" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.substring(1);
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-md">
      <nav className="container mx-auto px-4" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <Truck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-xl tracking-wide text-primary-foreground">
                  PATRIOT HAULS
                </span>
                <p className="text-xs text-secondary-foreground/70 -mt-1">
                  Trailer Rentals Directory
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
          <div className="hidden lg:flex lg:gap-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-secondary-foreground/80"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-3">
            <Button variant="outline" asChild className="border-primary/30 text-secondary-foreground hover:bg-primary/10 hover:text-primary">
              <Link to="/auth">Host Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <Link to="/auth?mode=signup">List Your Trailers</Link>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-secondary-foreground/20">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/20 text-primary"
                      : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 px-3 space-y-2">
                <Button variant="outline" asChild className="w-full border-primary/30 text-secondary-foreground hover:bg-primary/10">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Host Login
                  </Link>
                </Button>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    List Your Trailers
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