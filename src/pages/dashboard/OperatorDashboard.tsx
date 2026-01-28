import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Users,
  MessageSquare,
  Star,
  Plus,
  ArrowUpRight,
  Zap,
  Phone,
  Trophy,
  CheckCircle2,
  Rocket,
  Lock,
  Shield
} from "lucide-react";
import { PlanGate } from "@/components/subscription/PlanGate";
import { Link } from "react-router-dom";
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { BadgeApplicationModal } from "@/components/dashboard/BadgeApplicationModal";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 1240, // Mock baseline
    leads: 43,
    inquiries: 18,
    rating: 4.9
  });
  const [listings, setListings] = useState<any[]>([]);
  const [hasPendingClaim, setHasPendingClaim] = useState(false);
  const [badgeDefs, setBadgeDefs] = useState<{ badge_key: string; name: string }[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [newlyApprovedName, setNewlyApprovedName] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // Fetch Listings
      const { data: listingsData } = await supabase
        .from('business_listings')
        .select('*')
        .eq('user_id', user.id);

      setListings(listingsData || []);

      if (!listingsData || listingsData.length === 0) {
        // Check for pending claims
        const { data: claimData } = await supabase
          .from('business_claims')
          .select('*, business:business_listings(*)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (claimData?.business) {
          setHasPendingClaim(true);
          setListings([claimData.business]);
        }
      }

      // Fetch badge definitions for application
      const { data: badgeData } = await supabase
        .from('badge_definitions')
        .select('badge_key, name')
        .order('display_order');

      if (badgeData) setBadgeDefs(badgeData);

      // Fetch Leads (count)
      // In a real scenario, we'd join or filter by business_id
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (leadsCount !== null) {
        // Just a simple update for demo purposes
        setStats(prev => ({ ...prev, leads: leadsCount }));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listings.length > 0 && !hasPendingClaim) {
      const verifiedListing = listings.find(l => l.claimed === true);
      if (verifiedListing) {
        const hasCelebrated = localStorage.getItem(`celebrated_${verifiedListing.id}`);
        if (!hasCelebrated) {
          setNewlyApprovedName(verifiedListing.business_name);
          setShowCelebrate(true);
          triggerConfetti();
          localStorage.setItem(`celebrated_${verifiedListing.id}`, 'true');
        }
      }
    }
  }, [listings, hasPendingClaim]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#f97316', '#ffffff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#f97316', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const getUserName = () => {
    // 1. Try to get owner name from the first business listing
    if (listings && listings.length > 0) {
      const firstListing = listings[0];
      if (firstListing.owner_name) {
        return firstListing.owner_name.split(' ')[0];
      }
    }

    // 2. Fallback to auth metadata
    const meta = user?.user_metadata;
    const firstName = meta?.first_name ||
      (meta?.full_name ? meta.full_name.split(' ')[0] : null) ||
      (meta?.name ? meta.name.split(' ')[0] : null) ||
      meta?.display_name;

    if (firstName) return firstName;

    // 3. Final fallback
    return "Fellow Patriot";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-foreground uppercase tracking-tight">
            Operator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome back, <span className="font-semibold text-primary">{getUserName()}</span>.
          </p>
        </div>
        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20" asChild>
          <Link to="/dashboard/listing">
            <Plus className="mr-2 h-5 w-5" />
            List New Asset
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Visibility */}
        <Card className="p-6 border-none shadow-sm bg-card/50 backdrop-blur hover:bg-card transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Fleet Visibility</p>
            {/* <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> */}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight">{stats.views.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1">Last 30 Days</p>
            </div>
            <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 mb-1">
              +12% <ArrowUpRight className="h-3 w-3 ml-1" />
            </Badge>
          </div>
        </Card>

        {/* Conversion */}
        <Card className="p-6 border-none shadow-sm bg-card/50 backdrop-blur hover:bg-card transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Conversion</p>
            {/* <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> */}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight">{stats.leads}</h3>
              <p className="text-xs text-muted-foreground mt-1">New Qualified Leads</p>
            </div>
            <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 mb-1">
              +5.4% <ArrowUpRight className="h-3 w-3 ml-1" />
            </Badge>
          </div>
        </Card>

        {/* Inquiries */}
        <Card className="p-6 border-none shadow-sm bg-card/50 backdrop-blur hover:bg-card transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Direct Inquiries</p>
            {/* <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> */}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight">{stats.inquiries}</h3>
              <p className="text-xs text-muted-foreground mt-1">Click-to-Call</p>
            </div>
            <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 mb-1">
              +24% <ArrowUpRight className="h-3 w-3 ml-1" />
            </Badge>
          </div>
        </Card>

        {/* Rating */}
        <Card className="p-6 border-none shadow-sm bg-card/50 backdrop-blur hover:bg-card transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Partner Rating</p>
            {/* <Star className="h-4 w-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" /> */}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight">{stats.rating}</h3>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-500">TOP 1%</p>
              <p className="text-[10px] text-muted-foreground uppercase">Elite Status</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trust Profile Section */}
      <Card className="p-8 border-none shadow-sm bg-gradient-to-br from-[#0A0F1C] to-red-900/10 backdrop-blur overflow-hidden relative dark">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Shield className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-display">
              Your <span className="text-red-500">Trust Profile</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              These badges represent your verified status on the Patriot Hauls network. {listings.length > 0 ? "Higher trust levels lead to more inquiries and elite placement." : "List your first asset to start earning badges and building trust."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5" asChild>
                <Link to="/badges">View Standards</Link>
              </Button>
              {listings.length > 0 ? (
                <BadgeApplicationModal listingId={listings[0].id} badges={badgeDefs} />
              ) : (
                <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700" asChild>
                  <Link to="/dashboard/listing">List Your First Asset</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            {listings.length > 0 ? (
              <BadgeDisplay listingId={listings[0].id} size="lg" maxDisplay={10} />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="h-12 w-12 text-gray-600" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No Active Badges</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Active Fleet Deployment Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-card/50 flex justify-between items-center">
          <h2 className="text-lg font-bold font-display uppercase tracking-wider">Active Fleet Deployment</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">
              {hasPendingClaim ? '1 PENDING' : `${listings.length} UNITS ONLINE`}
            </span>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
              <Link to="/dashboard/listing">VIEW ALL</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">Tactical Name</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">Classification</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">Base Rate</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">Readiness</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No assets deployed yet. <Link to="/dashboard/listing" className="text-primary hover:underline">List your first asset</Link>.
                  </td>
                </tr>
              ) : (
                listings.slice(0, 5).map((listing) => (
                  <tr key={listing.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">
                      {listing.business_name}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground uppercase text-xs font-medium">
                      {listing.category || 'Utility Trailer'}
                    </td>
                    <td className="py-4 px-6 font-mono font-medium">
                      $75
                    </td>
                    <td className="py-4 px-6">
                      {hasPendingClaim ? (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 uppercase text-[10px] tracking-wider font-bold px-2 py-0.5 animate-pulse">
                          Pending Verification
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase text-[10px] tracking-wider font-bold px-2 py-0.5">
                          Ready
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link to="/dashboard/listing" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Edit</Link>
                      <span className="text-muted-foreground/30">•</span>
                      <Link to="/dashboard/analytics" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
                    </td>
                  </tr>
                ))
              )}
              {/* Mock Row to match design even if empty in development, or logic to hide */}
              {listings.length === 0 && (
                // If no listings, show a mock row for visualization of design
                <tr className="group hover:bg-muted/30 transition-colors opacity-60">
                  <td className="py-4 px-6 font-bold text-foreground">
                    2024 BIG TEX 70PI HEAVY DUTY (EXAMPLE)
                  </td>
                  <td className="py-4 px-6 text-muted-foreground uppercase text-xs font-medium">
                    UTILITY TRAILER
                  </td>
                  <td className="py-4 px-6 font-mono font-medium">
                    $75
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase text-[10px] tracking-wider font-bold px-2 py-0.5">
                      READY
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <span className="text-xs font-medium text-muted-foreground">Edit</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-xs font-medium text-muted-foreground">Analytics</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0F1C] border border-white/5 p-8 md:p-12 mb-8 shadow-2xl dark">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/10 mb-6 backdrop-blur">
            <Zap className="h-3 w-3 mr-2 text-yellow-400" />
            ENHANCED AI ENGINE V1.2
          </Badge>

          <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase tracking-tight mb-4">
            Precision Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Briefings</span>
          </h2>

          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Generate professional, mission-focused rig descriptions using our proprietary AI model. Stand out from the competition with high-impact copy.
          </p>

          <PlanGate minPlan="Pro" feature="AI Descriptions" fallback="lock">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold border-0" onClick={() => window.location.href = '/dashboard/business-info'}>
              Launch AI Briefing
            </Button>
          </PlanGate>
        </div>
      </div>

      {/* Celebration Modal */}
      <Dialog open={showCelebrate} onOpenChange={setShowCelebrate}>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0F1C] border-zinc-800 text-white p-0 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="relative z-10 bg-white/10 backdrop-blur-xl p-6 rounded-full border border-white/20 shadow-2xl">
              <Trophy className="h-20 w-20 text-white" />
            </div>
            {/* Animated Rings */}
            <div className="absolute h-32 w-32 border-2 border-white/20 rounded-full animate-ping"></div>
          </div>

          <div className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 mb-2">
                MISSION ACCOMPLISHED
              </Badge>
              <h2 className="text-3xl font-black uppercase tracking-tight font-display">
                Verification <span className="text-red-500">Confirmed</span>
              </h2>
              <p className="text-zinc-400">
                Congratulations! <strong>{newlyApprovedName}</strong> is now officially under your command.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold border-0 h-14" asChild>
                <Link to="/pricing">
                  <Zap className="mr-2 h-5 w-5 text-orange-500" />
                  Upgrade to Pro Fleet
                </Link>
              </Button>
              <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setShowCelebrate(false)}>
                Continue to Operator Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
