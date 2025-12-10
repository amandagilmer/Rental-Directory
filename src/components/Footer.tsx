import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Local Rental Directory</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting customers with local rental businesses
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-background/70 hover:text-background transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-background/70 hover:text-background transition-colors text-sm">
                  Browse Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-background transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-background/70 hover:text-background transition-colors text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-background/70 hover:text-background transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-background/70 hover:text-background transition-colors text-sm">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-background/70 hover:text-background transition-colors text-sm">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <a href="mailto:support@localrentaldirectory.com" className="text-background/70 hover:text-background transition-colors text-sm">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <a 
              href="mailto:support@localrentaldirectory.com" 
              className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              support@localrentaldirectory.com
            </a>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              © 2025 Local Rental Directory. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
