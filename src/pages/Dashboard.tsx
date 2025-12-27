import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  LogOut, 
  Link as LinkIcon, 
  Inbox, 
  Sparkles, 
  Shield, 
  MessageSquare, 
  Building2, 
  Package,
  Truck,
  Users,
  Settings,
  Home
} from 'lucide-react';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { cn } from '@/lib/utils';

// Main navigation tabs (pill style at top)
const mainTabs = [
  { name: 'Intel', href: '/dashboard', icon: BarChart3 },
  { name: 'Contacts', href: '/dashboard/leads', icon: Users },
  { name: 'Fleet', href: '/dashboard/listing', icon: Truck },
  { name: 'Business', href: '/dashboard/business-info', icon: Building2 },
];

// Secondary navigation in sidebar
const secondaryNav = [
  { name: 'Trigger Links', href: '/dashboard/trigger-links', icon: LinkIcon },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [businessName, setBusinessName] = useState('');

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

      // Fetch new leads count
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (!error && count !== null) {
        setNewLeadsCount(count);
      }
    };

    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leads-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
  };

  // Check if a main tab is active
  const isMainTabActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-secondary-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Navy Header */}
      <header className="bg-secondary text-secondary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Operational Dashboard Badge */}
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded">
                Operational Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                Directory
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                onClick={handleSignOut}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
          
          {/* Business Name */}
          <h1 className="font-display text-2xl md:text-3xl font-bold italic mt-3 tracking-wide uppercase">
            {businessName || 'Your Business'}
          </h1>
        </div>
        
        {/* Red Accent Bar */}
        <div className="h-1 bg-primary" />
      </header>

      {/* Main Navigation Tabs */}
      <div className="bg-background border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1" />
          
          {/* Pill Navigation */}
          <nav className="flex items-center gap-1 bg-muted/30 rounded-full p-1">
            {mainTabs.map((tab) => {
              const isActive = isMainTabActive(tab.href);
              const showBadge = tab.name === 'Contacts' && newLeadsCount > 0;
              
              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="uppercase tracking-wide text-xs font-semibold">{tab.name}</span>
                  {showBadge && (
                    <span className={cn(
                      'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                      isActive 
                        ? 'bg-primary-foreground text-primary' 
                        : 'bg-primary text-primary-foreground'
                    )}>
                      {newLeadsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex-1 flex justify-end">
            <Link to="/pricing">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
