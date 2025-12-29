import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  UserCheck, 
  Award, 
  MessageSquare, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  type: 'verification' | 'badge' | 'ticket' | 'contact';
  title: string;
  message: string;
  href: string;
  count?: number;
  timestamp?: string;
}

export default function HQAlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch pending verifications
        const { count: pendingVerifications } = await supabase
          .from('badge_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch open support tickets
        const { count: openTickets } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        // Fetch unread contact messages
        const { count: unreadContacts } = await supabase
          .from('contact_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        // Fetch recent unpublished listings (pending review)
        const { count: pendingListings } = await supabase
          .from('business_listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', false);

        const newAlerts: Alert[] = [];

        if (pendingVerifications && pendingVerifications > 0) {
          newAlerts.push({
            id: 'verifications',
            type: 'verification',
            title: 'Pending Verifications',
            message: `${pendingVerifications} badge verification${pendingVerifications > 1 ? 's' : ''} awaiting review`,
            href: '/admin/badges',
            count: pendingVerifications,
          });
        }

        if (openTickets && openTickets > 0) {
          newAlerts.push({
            id: 'tickets',
            type: 'ticket',
            title: 'Open Support Tickets',
            message: `${openTickets} ticket${openTickets > 1 ? 's' : ''} need attention`,
            href: '/admin/support',
            count: openTickets,
          });
        }

        if (unreadContacts && unreadContacts > 0) {
          newAlerts.push({
            id: 'contacts',
            type: 'contact',
            title: 'New Contact Messages',
            message: `${unreadContacts} unread message${unreadContacts > 1 ? 's' : ''}`,
            href: '/admin/contacts',
            count: unreadContacts,
          });
        }

        if (pendingListings && pendingListings > 0) {
          newAlerts.push({
            id: 'listings',
            type: 'badge',
            title: 'Unpublished Listings',
            message: `${pendingListings} listing${pendingListings > 1 ? 's' : ''} awaiting publish`,
            href: '/admin/listings',
            count: pendingListings,
          });
        }

        setAlerts(newAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'verification':
        return UserCheck;
      case 'badge':
        return Award;
      case 'ticket':
        return MessageSquare;
      case 'contact':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getColor = (type: Alert['type']) => {
    switch (type) {
      case 'verification':
        return 'bg-amber-500 text-white';
      case 'badge':
        return 'bg-accent text-accent-foreground';
      case 'ticket':
        return 'bg-primary text-primary-foreground';
      case 'contact':
        return 'bg-green-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          HQ Alerts
        </h3>
        {alerts.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">All clear, Commander</p>
          <p className="text-xs mt-1">No pending actions required</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = getIcon(alert.type);
            const colorClass = getColor(alert.type);

            return (
              <Link
                key={alert.id}
                to={alert.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">
                      {alert.title}
                    </p>
                    {alert.count && alert.count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                        {alert.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.message}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
