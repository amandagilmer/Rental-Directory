import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  Clock,
  Shield,
  Search,
  FileCheck,
  UserCheck,
} from "lucide-react";

interface BadgeDefinition {
  id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earning_criteria: string;
  is_auto_calculated: boolean;
  requires_verification: boolean;
  display_order: number;
}

const colorMap: Record<string, string> = {
  green: "bg-green-500/10 border-green-500/30",
  blue: "bg-blue-500/10 border-blue-500/30",
  yellow: "bg-yellow-500/10 border-yellow-500/30",
  orange: "bg-orange-500/10 border-orange-500/30",
  purple: "bg-purple-500/10 border-purple-500/30",
  primary: "bg-primary/10 border-primary/30",
  red: "bg-red-500/10 border-red-500/30",
  gold: "bg-amber-500/10 border-amber-500/30",
  silver: "bg-slate-500/10 border-slate-500/30",
};

const BadgeExplainer = () => {
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from("badge_definitions")
        .select("*")
        .order("display_order");

      if (!error && data) {
        setBadges(data);
      }
      setLoading(false);
    };

    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#0A0F1C]" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>

          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              Trust <span className="text-red-600">Badges</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
              We don't just list trailers; we vet the people behind them. Our tactical trust system identifies elite operators who are verified, insured, and accountable.
            </p>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-tight italic font-display">
                Elite Vetting <span className="text-red-600">Our Protocol</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center border border-red-600/30">
                    <UserCheck className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Identity Verification</h3>
                    <p className="text-gray-400">Every operator must submit government-issued ID and proof of business ownership to ensure they are a legitimate operation.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                    <FileCheck className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Insurance Compliance</h3>
                    <p className="text-gray-400">We verify active business insurance and bonding to protect renters from fly-by-night operations and ensure coverage.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center border border-amber-600/30">
                    <Search className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Continuous Monitoring</h3>
                    <p className="text-gray-400">Ratings are monitored in real-time. Operators who fall below our standards lose their elite status immediately.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative p-8 bg-[#0A0F1C] border border-white/10 rounded-2xl">
                <blockquote className="text-2xl font-medium italic text-gray-200 leading-snug">
                  "When you rent from an operator on Patriot Hauls, you're not just getting equipment—you're getting a commitment to quality and patriotism from a vetted professional."
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-white italic">PH</div>
                  <div>
                    <div className="font-bold text-white">Patriot Hauls Command</div>
                    <div className="text-sm text-gray-400 font-medium">Standards of Excellence</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display mb-4">The Badge <span className="text-red-600">Standard</span></h2>
            <p className="text-gray-300 max-w-2xl mx-auto font-medium">Earned, not given. These are the marks of distinction in our network.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const colorClass = colorMap[badge.color] || colorMap.primary;

                return (
                  <Card
                    key={badge.id}
                    className="p-8 bg-white/5 hover:bg-white/10 transition-all duration-300 border-white/10 flex flex-col items-center text-center group"
                  >
                    {/* Badge Image */}
                    <div
                      className={`h-32 w-32 flex-shrink-0 bg-white rounded-full overflow-hidden border border-black/5 shadow-xl badge-glisten-container badge-glisten-perpetual transition-transform duration-500 hover:scale-105`}
                    >
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="h-full w-full object-cover mix-blend-multiply"
                      />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 uppercase italic font-display tracking-tight">
                      {badge.name}
                    </h3>

                    <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="w-full space-y-4">
                      <div className="bg-[#0A0F1C] rounded-xl p-5 border border-white/10">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
                          Earning Protocol
                        </h4>
                        <p className="text-sm text-gray-200 font-medium">
                          {badge.earning_criteria}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        {badge.is_auto_calculated && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px] uppercase font-bold tracking-widest px-3">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Auto-Earned
                          </Badge>
                        )}
                        {badge.requires_verification && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px] uppercase font-bold tracking-widest px-3">
                            <Upload className="h-3 w-3 mr-1" />
                            Verify Required
                          </Badge>
                        )}
                        {!badge.is_auto_calculated && !badge.requires_verification && (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-[10px] uppercase font-bold tracking-widest px-3">
                            <Clock className="h-3 w-3 mr-1" />
                            Command Awarded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-red-900/10 to-[#0A0F1C] border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display mb-6">
            Join the <span className="text-red-600">Vetted</span> Network
          </h2>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
            Build your reputation as a trusted Patriot Hauls operator. List your rigs today and start earning your tactical trust badges.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 h-14 px-8 text-lg font-bold uppercase tracking-wide shadow-xl shadow-red-600/20 antialiased">
              <Link to="/auth?mode=signup">List Your Rigs</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-lg font-bold uppercase tracking-wide antialiased">
              <Link to="/">Browse Directory</Link>
            </Button>
          </div>

          {/* Platform Integrity Disclaimer */}
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-display">Platform Integrity Statement</h3>
            </div>
            <p className="text-gray-400 leading-relaxed italic">
              "Patriot Hauls maintains a zero-tolerance policy for substandard service or integrity breaches. In the event that any of our operators fall out of our rigorous standards or fail to maintain verified status, they are immediately removed from the platform. We conduct regular audits to ensure every badge on this directory represents a current, high-performing professional you can trust."
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BadgeExplainer;
