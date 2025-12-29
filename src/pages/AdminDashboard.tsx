import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  MessageSquare, 
  BarChart3, 
  Ticket, 
  LogOut, 
  Home,
  Shield,
  Star,
  Upload,
  FolderTree,
  FileText, 
  HelpCircle, 
  BookOpen, 
  Mail, 
  MessagesSquare,
  Award,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'HQ Overview', href: '/admin', icon: Compass },
  { name: 'Operators', href: '/admin/listings', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Badges', href: '/admin/badges', icon: Award },
  { name: 'Bulk Import', href: '/admin/import', icon: Upload },
  { name: 'Contacts', href: '/admin/leads', icon: MessageSquare },
  { name: 'Field Reports', href: '/admin/reviews', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Support Tickets', href: '/admin/support', icon: Ticket },
  { name: 'Live Chat', href: '/admin/live-chat', icon: MessagesSquare },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { name: 'The Feed', href: '/admin/blog', icon: BookOpen },
  { name: 'Messages', href: '/admin/contacts', icon: Mail },
];

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-secondary-foreground font-display text-xl">
          Loading HQ...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-secondary text-secondary-foreground sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg">PATRIOT HQ</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-secondary-foreground/80"
            onClick={handleSignOut}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-1 bg-primary" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-0 w-64 h-screen bg-secondary text-secondary-foreground transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-secondary-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-wide">PATRIOT HQ</h2>
                <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/60">
                  Admin Command
                </p>
              </div>
            </div>
            <p className="text-xs text-secondary-foreground/60 mt-3 truncate">{user.email}</p>
          </div>
          
          {/* Navigation */}
          <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-secondary-foreground/10 bg-secondary">
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Command Center
            </Link>
            
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Directory
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
              onClick={handleSignOut}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Exiting...' : 'Exit HQ'}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {navigation.find(n => 
                    location.pathname === n.href || 
                    (n.href !== '/admin' && location.pathname.startsWith(n.href))
                  )?.name || 'HQ Overview'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Network command and control center
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Exiting...' : 'Exit'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
