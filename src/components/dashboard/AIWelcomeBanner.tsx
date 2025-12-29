import { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AIWelcomeBannerProps {
  operatorName?: string;
  stats?: {
    newLeads?: number;
    totalViews?: number;
    reviewScore?: number;
  };
}

export default function AIWelcomeBanner({ operatorName, stats }: AIWelcomeBannerProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-welcome-message', {
        body: { operatorName, stats }
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (err) {
      console.error('Error fetching welcome message:', err);
      setMessage('Welcome back to the Command Center. Mission awaits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [operatorName]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessage();
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-secondary via-secondary to-primary/80 p-6 text-secondary-foreground">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">
              Command Center
            </p>
            <p className={cn(
              "text-lg md:text-xl font-display font-bold tracking-wide transition-opacity duration-300",
              loading && "opacity-50"
            )}>
              {loading ? 'Loading mission briefing...' : message}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Get new message"
        >
          <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
