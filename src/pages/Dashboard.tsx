import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from '@/components/dashboard/NotificationBell';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch business name
      const { data: listingData } = await supabase
        .from('business_listings')
        .select('business_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (listingData?.business_name) {
        setBusinessName(listingData.business_name);
      }
    };
    fetchData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
        <div className="animate-pulse text-white font-display text-xl">
          Loading Command Center...
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
                <p className="text-sm font-bold text-foreground">{businessName || 'Your Outpost'}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Operator</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
