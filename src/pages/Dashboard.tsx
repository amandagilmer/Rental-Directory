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
  Sparkles, 
  Shield, 
  MessageSquare, 
  Building2, 
  Truck,
  Users,
  Settings,
  Home,
  Compass,
  Menu,
  X
} from 'lucide-react';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { cn } from '@/lib/utils';

// Main navigation tabs using Patriot Hauls terminology
const mainTabs = [
  { name: 'Command Center', href: '/dashboard', icon: Compass },
  { name: 'Contacts', href: '/dashboard/leads', icon: Users },
  { name: 'Fleet', href: '/dashboard/listing', icon: Truck },
  { name: 'Your Post', href: '/dashboard/business-info', icon: Building2 },
];

// Secondary navigation
const secondaryNav = [
  { name: 'Trigger Links', href: '/dashboard/trigger-links', icon: LinkIcon },
  { name: 'Field Reports', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Your Numbers', href: '/dashboard/analytics', icon: BarChart3 },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isMainTabActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-secondary-foreground font-display text-xl">
          Loading Command Center...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Navy Header */}
      <header className="bg-secondary text-secondary-foreground sticky top-0 z-50">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo & Badge */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden md:flex items-center gap-3">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  Command Center
                </span>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <NotificationBell />
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden lg:inline">HQ</span>
                </Link>
              )}
              
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Directory</span>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                onClick={handleSignOut}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-2">{loggingOut ? 'Exiting...' : 'Exit'}</span>
              </Button>
            </div>
          </div>
          
          {/* Business Name */}
          <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold italic mt-2 tracking-wide uppercase truncate">
            {businessName || 'Your Outpost'}
          </h1>
        </div>
        
        {/* Red Accent Bar */}
        <div className="h-1 bg-primary" />
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[88px] bg-background z-40 p-4 space-y-2 border-t border-border">
          {[...mainTabs, ...secondaryNav].map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isMainTabActive(tab.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
              {tab.name === 'Contacts' && newLeadsCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {newLeadsCount}
                </span>
              )}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-border mt-4">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted rounded-lg"
              >
                <Shield className="h-5 w-5" />
                Admin HQ
              </Link>
            )}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted rounded-lg"
            >
              <Home className="h-5 w-5" />
              Back to Directory
            </Link>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs - Desktop */}
      <div className="hidden md:block bg-background border-b border-border sticky top-[89px] z-40">
        <div className="px-6 py-3 flex items-center justify-between">
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
          
          {/* Secondary Nav & Upgrade */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <nav className="hidden lg:flex items-center gap-1">
              {secondaryNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    location.pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <Link to="/pricing">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">Upgrade</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
