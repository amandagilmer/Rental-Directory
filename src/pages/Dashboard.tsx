import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Home, LayoutDashboard, FileText, BarChart3, Settings, LogOut, Upload, Link as LinkIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Listing', href: '/dashboard/listing', icon: FileText },
  { name: 'Leads', href: '/dashboard/leads', icon: Inbox },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'GMB Integration', href: '/dashboard/gmb', icon: LinkIcon },
  { name: 'Bulk Import', href: '/dashboard/bulk-import', icon: Upload },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchNewLeadsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        if (!error && count !== null) {
          setNewLeadsCount(count);
        }
      } catch (error) {
        console.error('Error fetching leads count:', error);
      }
    };

    fetchNewLeadsCount();

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
          fetchNewLeadsCount();
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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r border-border">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const showBadge = item.name === 'Leads' && newLeadsCount > 0;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </span>
                  {showBadge && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-semibold rounded-full',
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
            
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to Directory
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={handleSignOut}
              disabled={loggingOut}
            >
              <LogOut className="h-5 w-5" />
              {loggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
