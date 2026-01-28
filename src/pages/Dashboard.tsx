import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Menu, X, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [hasPendingClaim, setHasPendingClaim] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userType, setUserType] = useState<'host' | 'renter' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile for role check
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, business_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserType(profile.user_type as 'host' | 'renter');

        // Redirect renters if they hit /dashboard directly
        if (profile.user_type === 'renter' && location.pathname === '/dashboard') {
          navigate('/dashboard/renter-profile');
        }
      }

      // Fetch business name (primarily for hosts)
      const { data: listingData } = await supabase
        .from('business_listings')
        .select('business_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (listingData?.business_name) {
        setBusinessName(listingData.business_name);
      } else {
        // If no listing, check for pending claims
        const { data: claimData } = await supabase
          .from('business_claims')
          .select('*, business:business_listings(business_name)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (claimData) {
          setHasPendingClaim(true);
          if (claimData.business?.business_name) {
            setBusinessName(claimData.business.business_name);
          }
        }
      }
    };
    fetchData();
  }, [user, navigate, location.pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
        <div className="animate-pulse text-white font-display text-xl">
          Loading Operator Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">

        {/* Mobile Header */}
        <header className="md:hidden bg-[#0A0F1C] border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-[#0A0F1C] border-r border-white/10 w-80">
                <div className="h-full overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {/* Force flex layout for the sidebar items inside mobile drawer */}
                    <div className="h-full [&>div]:flex [&>div]:w-full [&>div]:border-none">
                      <DashboardSidebar />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex flex-col items-start pt-[2px]">
              <span className="font-display font-black text-white text-lg tracking-tighter uppercase italic leading-none">PATRIOT HAULS</span>
              <div className="h-1 w-full bg-red-600 -skew-x-12 origin-left" />
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative animate-fade-in">
          {/* Top Right Actions (Desktop) */}
          <div className="hidden md:flex absolute top-6 right-8 items-center gap-4 z-10">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-foreground">{businessName || (userType === 'renter' ? 'Renter Profile' : 'Your Outpost')}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {userType === 'renter' ? 'Renter' : 'Operator'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {hasPendingClaim && (
            <div className="mb-6 animate-fade-in">
              <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="font-bold flex items-center gap-2 text-yellow-800">
                  Verification In Progress
                </AlertTitle>
                <AlertDescription className="text-yellow-700 font-medium">
                  Your claim for <span className="font-bold">{businessName || 'your business'}</span> is currently being reviewed by our command team. You will be approved or denied within 24 hours. You have partial access to the Operator Dashboard.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
