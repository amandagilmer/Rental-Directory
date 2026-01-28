import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#0A0F1C] border-t border-white/5 text-gray-400">
      {/* Red accent bar at top */}
      <div className="h-1 bg-primary" />

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-display text-2xl font-bold italic text-primary-foreground border-b-2 border-primary inline-block pb-1">
              PATRIOT HAULS
            </h3>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-xs">
              Supporting American infrastructure by connecting the workers who build our nation with the equipment they need to get the job done.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold text-secondary-foreground">FB</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold text-secondary-foreground">IG</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors flex items-center justify-center"
                aria-label="Twitter"
              >
                <span className="text-xs font-bold text-secondary-foreground">TW</span>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-primary-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/the-pledge" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  The Pledge
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-primary-foreground">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/insurance" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Insurance Info
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-primary-foreground">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Join the Brotherhood
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  List Your Trailer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-secondary-foreground/50 text-sm text-center">
            © 2025 Patriot Hauls. Built Rugged. Forged for Americans.
          </p>
        </div>
      </div>
    </footer>
  );
};
