import { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NetworkStats {
  totalOperators?: number;
  activeToday?: number;
  newLeads?: number;
  pendingVerifications?: number;
}

interface HQStatusBannerProps {
  networkStats?: NetworkStats;
}

export default function HQStatusBanner({ networkStats }: HQStatusBannerProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-network-message', {
        body: { networkStats }
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (err) {
      console.error('Error fetching network message:', err);
      setMessage('Network strong. All systems operational.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [networkStats?.totalOperators]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessage();
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary via-primary to-secondary p-5 text-primary-foreground">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">
              HQ Command Status
            </p>
            <p className={cn(
              "text-lg md:text-xl font-display font-bold tracking-wide transition-opacity duration-300",
              loading && "opacity-50"
            )}>
              {loading ? 'Syncing network status...' : message}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
