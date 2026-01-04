import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Menu, X, Shield, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
        <div className="animate-pulse text-white font-display text-xl uppercase tracking-widest">
          Loading HQ...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex text-foreground">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">

        {/* Mobile Header */}
        <header className="lg:hidden bg-[#0A0F1C] border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
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
                      <AdminSidebar />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex flex-col items-start pt-[2px]">
              <span className="font-display font-black text-white text-lg tracking-tighter uppercase italic leading-none">PATRIOT HQ</span>
              <div className="h-1 w-full bg-blue-600 -skew-x-12 origin-left" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={handleSignOut}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative animate-fade-in bg-white dark:bg-[#0A0F1C]">
          {/* Top Right Actions (Desktop) - Just user info */}
          <div className="hidden lg:flex absolute top-6 right-8 items-center gap-4 z-10">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Headquarters</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-600 font-bold">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
