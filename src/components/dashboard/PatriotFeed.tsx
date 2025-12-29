import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Shield, Lightbulb, Zap, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkEvent {
  id: string;
  event_type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  created_at: string;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  shield: Shield,
  lightbulb: Lightbulb,
  zap: Zap,
  users: Users,
  trending: TrendingUp,
  alert: AlertTriangle,
};

const colorMap: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  gold: 'bg-amber-500 text-white',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-black',
};

export default function PatriotFeed() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('network_events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setEvents(data);
      }
    };

    fetchEvents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('network-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'network_events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-rotate through events
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];
  const IconComponent = iconMap[currentEvent.icon] || Zap;
  const colorClass = colorMap[currentEvent.color] || colorMap.primary;

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-lg">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      
      <div className={cn(
        "flex items-center gap-4 px-4 py-3 transition-all duration-300",
        isAnimating && "opacity-0 translate-x-4"
      )}>
        <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", colorClass)}>
          <IconComponent className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Patriot Feed
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentEvent.title}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {currentEvent.message}
          </p>
        </div>

        {events.length > 1 && (
          <div className="flex gap-1">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
