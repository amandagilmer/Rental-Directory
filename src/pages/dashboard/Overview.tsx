import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MousePointerClick, Phone, ShoppingCart } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEngagements: 0,
    totalCalls: 0,
    totalConversions: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch listings
      const { data: listingsData } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', user.id);

      if (listingsData && listingsData.length > 0) {
        const listingIds = listingsData.map(l => l.id);
        
        // Fetch analytics
        const { data: analyticsData } = await supabase
          .from('listing_analytics')
          .select('views, search_impressions, date')
          .in('listing_id', listingIds)
          .order('date', { ascending: true });

        // Fetch interactions
        const { data: interactionsData } = await supabase
          .from('interactions')
          .select('interaction_type, created_at')
          .in('host_id', listingIds);

        if (analyticsData) {
          const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
          const totalEngagements = interactionsData?.filter(i => 
            i.interaction_type === 'click' || i.interaction_type === 'inquiry'
          ).length || 0;
          const totalCalls = interactionsData?.filter(i => 
            i.interaction_type === 'call'
          ).length || 0;
          const totalConversions = interactionsData?.filter(i => 
            i.interaction_type === 'conversion'
          ).length || 0;
          
          setStats({
            totalViews,
            totalEngagements,
            totalCalls,
            totalConversions
          });

          // Generate chart data for last 7 days
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = analyticsData.filter(a => a.date === dateStr);
            const views = dayData.reduce((sum, d) => sum + (d.views || 0), 0);
            
            return {
              date: format(date, 'MMM d'),
              views
            };
          });
          
          setChartData(last7Days);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading intel...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Intelligence Views',
      value: stats.totalViews,
      icon: Eye,
      borderColor: 'border-b-blue-500'
    },
    {
      label: 'Asset Engagement',
      value: stats.totalEngagements,
      icon: MousePointerClick,
      borderColor: 'border-b-green-500'
    },
    {
      label: 'Call Signals',
      value: stats.totalCalls,
      icon: Phone,
      borderColor: 'border-b-yellow-500'
    },
    {
      label: 'Converted Missions',
      value: stats.totalConversions,
      icon: ShoppingCart,
      borderColor: 'border-b-amber-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.label} 
            className={`bg-card border-0 shadow-md rounded-xl overflow-hidden border-b-4 ${stat.borderColor}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Flow Analysis Chart */}
        <Card className="lg:col-span-2 bg-card border-0 shadow-md rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-6">
              Signal Flow Analysis
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 75%, 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 75%, 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 85%)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(220, 15%, 65%)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(220, 15%, 65%)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(220, 15%, 85%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(0, 75%, 45%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Heatmap */}
        <Card className="bg-card border-0 shadow-md rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-6">
              Asset Heatmap
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Top performing assets will appear here as you collect more data.
              </p>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  No asset data yet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
