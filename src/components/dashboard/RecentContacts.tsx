import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string | null;
  status: string;
  created_at: string;
}

export default function RecentContacts() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLeads = async () => {
      // First get the user's business listing
      const { data: listing } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!listing) {
        setLoading(false);
        return;
      }

      // Then fetch their leads
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', listing.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    };

    fetchLeads();
  }, [user]);

  const statusColors: Record<string, string> = {
    new: 'bg-green-600 text-white',
    contacted: 'bg-accent text-accent-foreground',
    converted: 'bg-primary text-primary-foreground',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Recent Contacts
        </h3>
        <Link 
          to="/dashboard/leads"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No contacts yet</p>
          <p className="text-xs mt-1">They'll show up here when renters reach out</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              to="/dashboard/leads"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-display font-bold text-sm">
                {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {lead.name}
                  </p>
                  <Badge className={cn("text-[10px] px-1.5 py-0", statusColors[lead.status])}>
                    {lead.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  {lead.service_type && (
                    <>
                      <span>•</span>
                      <span className="truncate">{lead.service_type}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={`tel:${lead.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
