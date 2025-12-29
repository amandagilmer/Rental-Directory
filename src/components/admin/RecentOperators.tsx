import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building2, ChevronRight, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Operator {
  id: string;
  business_name: string;
  address: string | null;
  is_published: boolean;
  created_at: string;
  category: string;
}

export default function RecentOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      const { data, error } = await supabase
        .from('business_listings')
        .select('id, business_name, address, is_published, created_at, category')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setOperators(data);
      }
      setLoading(false);
    };

    fetchOperators();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Recent Operators
        </h3>
        <Link 
          to="/admin/listings"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {operators.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No operators yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {operators.map((operator) => (
            <Link
              key={operator.id}
              to="/admin/listings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-display font-bold text-sm">
                {operator.business_name.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {operator.business_name}
                  </p>
                  {operator.is_published ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {operator.address && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{operator.address.split(',')[0]}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatDistanceToNow(new Date(operator.created_at), { addSuffix: true })}</span>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                {operator.category}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
