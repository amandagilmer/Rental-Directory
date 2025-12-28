import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Medal,
  Star,
  Zap,
  Shield,
  Truck,
  Flag,
  Award,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Clock,
  LucideIcon,
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

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  medal: Medal,
  star: Star,
  zap: Zap,
  shield: Shield,
  truck: Truck,
  flag: Flag,
  award: Award,
};

const colorMap: Record<string, string> = {
  green: "text-green-500 bg-green-500/10 border-green-500/30",
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  orange: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  primary: "text-primary bg-primary/10 border-primary/30",
  red: "text-red-500 bg-red-500/10 border-red-500/30",
  gold: "text-amber-500 bg-amber-500/10 border-amber-500/30",
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Operator Badges
            </h1>
            <p className="text-xl text-muted-foreground">
              Our badge system helps renters identify trusted, qualified operators. 
              Each badge represents a specific achievement or verification that sets 
              operators apart from the competition.
            </p>
          </div>
        </div>
      </section>

      {/* Badge Types Legend */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Auto-Earned</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Requires Verification</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Manually Awarded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-muted-foreground">Loading badges...</div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const Icon = iconMap[badge.icon] || Shield;
                const colorClass = colorMap[badge.color] || colorMap.primary;

                return (
                  <Card
                    key={badge.id}
                    className="p-6 bg-card hover:shadow-lg transition-shadow border"
                  >
                    {/* Badge Icon & Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl ${colorClass} border`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Earning Criteria */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        How to Earn
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {badge.earning_criteria}
                      </p>
                    </div>

                    {/* Badge Type */}
                    <div className="flex items-center gap-2">
                      {badge.is_auto_calculated && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Auto-Earned
                        </Badge>
                      )}
                      {badge.requires_verification && (
                        <Badge variant="secondary" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          Verification Required
                        </Badge>
                      )}
                      {!badge.is_auto_calculated && !badge.requires_verification && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Manually Awarded
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Earn Your Badges?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the Patriot Hauls Directory and start building your reputation. 
            Verified operators get more visibility and trust from renters.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg">
                List Your Fleet
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Browse Operators
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BadgeExplainer;
