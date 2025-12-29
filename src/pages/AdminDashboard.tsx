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
  FolderTree
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { FileText, HelpCircle, BookOpen, Mail, MessagesSquare } from 'lucide-react';

import { Award } from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Listings', href: '/admin/listings', icon: Building2 },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Badges', href: '/admin/badges', icon: Award },
  { name: 'Bulk Import', href: '/admin/import', icon: Upload },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Support Tickets', href: '/admin/support', icon: Ticket },
  { name: 'Live Chat', href: '/admin/live-chat', icon: MessagesSquare },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { name: 'Blog', href: '/admin/blog', icon: BookOpen },
  { name: 'Contact Messages', href: '/admin/contacts', icon: Mail },
];

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r border-border">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Admin</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-border mt-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Building2 className="h-5 w-5" />
                Vendor Dashboard
              </Link>
              
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
            </div>
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
