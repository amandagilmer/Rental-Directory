import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Truck, MessageSquare, Eye, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

import HQStatusBanner from '@/components/admin/HQStatusBanner';
import NetworkStatsCard from '@/components/admin/NetworkStatsCard';
import HQAlertsFeed from '@/components/admin/HQAlertsFeed';
import RecentOperators from '@/components/admin/RecentOperators';
import PatriotFeedManager from '@/components/admin/PatriotFeedManager';

interface NetworkStats {
  totalOperators: number;
  publishedOperators: number;
  totalFleet: number;
  totalLeads: number;
  todayLeads: number;
  totalViews: number;
}

interface ChartData {
  date: string;
  operators: number;
  leads: number;
}

export default function AdminHQOverview() {
  const [stats, setStats] = useState<NetworkStats>({
    totalOperators: 0,
    publishedOperators: 0,
    totalFleet: 0,
    totalLeads: 0,
    todayLeads: 0,
    totalViews: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const [operatorsRes, servicesRes, leadsRes, analyticsRes] = await Promise.all([
          supabase.from('business_listings').select('id, is_published, created_at'),
          supabase.from('business_services').select('id').eq('is_available', true),
          supabase.from('leads').select('id, created_at'),
          supabase.from('listing_analytics')
            .select('views, date')
            .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd')),
        ]);

        const totalOperators = operatorsRes.data?.length || 0;
        const publishedOperators = operatorsRes.data?.filter(o => o.is_published).length || 0;
        const totalFleet = servicesRes.data?.length || 0;
        const totalLeads = leadsRes.data?.length || 0;
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayLeads = leadsRes.data?.filter(l => 
          format(new Date(l.created_at), 'yyyy-MM-dd') === today
        ).length || 0;
        const totalViews = analyticsRes.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;

        setStats({
          totalOperators,
          publishedOperators,
          totalFleet,
          totalLeads,
          todayLeads,
          totalViews,
        });

        // Build chart data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
          const dayOperators = operatorsRes.data?.filter(o => 
            format(new Date(o.created_at), 'yyyy-MM-dd') <= date
          ).length || 0;
          const dayLeads = leadsRes.data?.filter(l => 
            format(new Date(l.created_at), 'yyyy-MM-dd') === date
          ).length || 0;
          
          return {
            date: format(subDays(new Date(), 6 - i), 'EEE'),
            operators: dayOperators,
            leads: dayLeads,
          };
        });

        setChartData(last7Days);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-muted rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HQ Status Banner */}
      <HQStatusBanner 
        networkStats={{
          totalOperators: stats.totalOperators,
          activeToday: stats.publishedOperators,
          newLeads: stats.todayLeads,
        }}
      />

      {/* Network Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NetworkStatsCard
          title="Total Operators"
          value={stats.totalOperators}
          subtitle={`${stats.publishedOperators} published`}
          icon={Users}
          variant="primary"
        />
        <NetworkStatsCard
          title="Network Fleet"
          value={stats.totalFleet}
          subtitle="Rigs available"
          icon={Truck}
          variant="accent"
        />
        <NetworkStatsCard
          title="Total Contacts"
          value={stats.totalLeads}
          subtitle={`${stats.todayLeads} today`}
          icon={MessageSquare}
          variant="success"
        />
        <NetworkStatsCard
          title="Weekly Intel"
          value={stats.totalViews}
          subtitle="Total views"
          icon={Eye}
          variant="warning"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <HQAlertsFeed />
          <RecentOperators />
        </div>

        {/* Center Column - Network Growth Chart */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Network Growth
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Operators
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Leads
                </span>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="operatorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215 85% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(215 85% 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 75% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0 75% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(220 15% 65%)' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(220 15% 65%)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220 25% 15%)', 
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="operators"
                    stroke="hsl(215 85% 50%)"
                    strokeWidth={2}
                    fill="url(#operatorsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(0 75% 45%)"
                    strokeWidth={2}
                    fill="url(#leadsGradientAdmin)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.publishedOperators}
                </p>
                <p className="text-xs text-muted-foreground">Active Outposts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.totalLeads > 0 ? Math.round((stats.todayLeads / stats.totalLeads) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Lead Flow Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Patriot Feed Manager */}
        <div className="lg:col-span-1">
          <PatriotFeedManager />
        </div>
      </div>
    </div>
  );
}
