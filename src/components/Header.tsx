import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Find a Rental", href: "/" },
  { name: "Trust Badges", href: "/badges" },
  { name: "Operator Dashboard", href: "/dashboard" },
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
      <div className="h-1 bg-red-600" />

      <nav className="bg-[#0A0F1C] border-b border-white/5" aria-label="Global">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
                <div className="flex flex-col items-start pt-[2px]">
                  <span className="font-display font-black text-white text-2xl tracking-tighter uppercase italic leading-none">PATRIOT HAULS</span>
                  <div className="h-1.5 w-full bg-red-600 mt-1 -skew-x-12 origin-left" />
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
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
                    "text-sm font-bold uppercase tracking-wider transition-colors",
                    isActive(item.href)
                      ? "text-red-500"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 font-bold uppercase tracking-wide px-6 border-0">
                <Link to="/auth?mode=signup">List Your Rigs</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 bg-[#0A0F1C]">
            <div className="container mx-auto px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-bold uppercase tracking-wider transition-colors",
                    isActive(item.href)
                      ? "bg-white/10 text-red-500"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    List Your Rigs
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

