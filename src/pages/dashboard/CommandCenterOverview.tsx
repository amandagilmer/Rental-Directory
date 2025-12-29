import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Users, Truck, Star, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

import AIWelcomeBanner from '@/components/dashboard/AIWelcomeBanner';
import PatriotFeed from '@/components/dashboard/PatriotFeed';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentContacts from '@/components/dashboard/RecentContacts';
import FieldReportsWidget from '@/components/dashboard/FieldReportsWidget';

interface DashboardStats {
  totalViews: number;
  newLeads: number;
  fleetCount: number;
  averageRating: number | null;
  weeklyChange: number;
}

interface ChartData {
  date: string;
  views: number;
  leads: number;
}

export default function CommandCenterOverview() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    newLeads: 0,
    fleetCount: 0,
    averageRating: null,
    weeklyChange: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Get business listing
        const { data: listing } = await supabase
          .from('business_listings')
          .select('id, business_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!listing) {
          setLoading(false);
          return;
        }

        setBusinessName(listing.business_name);

        // Fetch all data in parallel
        const [analyticsRes, leadsRes, servicesRes, reviewsRes] = await Promise.all([
          supabase
            .from('listing_analytics')
            .select('views, date')
            .eq('listing_id', listing.id)
            .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
            .order('date', { ascending: true }),
          supabase
            .from('leads')
            .select('id, created_at, status')
            .eq('business_id', listing.id),
          supabase
            .from('business_services')
            .select('id')
            .eq('listing_id', listing.id)
            .eq('is_available', true),
          supabase
            .from('your_reviews')
            .select('rating')
            .eq('business_id', listing.id),
        ]);

        // Calculate stats
        const totalViews = analyticsRes.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;
        const newLeads = leadsRes.data?.filter(l => l.status === 'new').length || 0;
        const fleetCount = servicesRes.data?.length || 0;
        
        let averageRating: number | null = null;
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          averageRating = Math.round(
            (reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length) * 10
          ) / 10;
        }

        // Calculate week over week change
        const lastWeekViews = analyticsRes.data?.slice(0, 3).reduce((sum, a) => sum + (a.views || 0), 0) || 0;
        const thisWeekViews = analyticsRes.data?.slice(-3).reduce((sum, a) => sum + (a.views || 0), 0) || 0;
        const weeklyChange = lastWeekViews > 0 
          ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100) 
          : 0;

        setStats({
          totalViews,
          newLeads,
          fleetCount,
          averageRating,
          weeklyChange,
        });

        // Build chart data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
          const dayData = analyticsRes.data?.find(a => a.date === date);
          const dayLeads = leadsRes.data?.filter(l => 
            format(new Date(l.created_at), 'yyyy-MM-dd') === date
          ).length || 0;
          
          return {
            date: format(subDays(new Date(), 6 - i), 'EEE'),
            views: dayData?.views || 0,
            leads: dayLeads,
          };
        });

        setChartData(last7Days);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-12 bg-muted rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Welcome Banner */}
      <AIWelcomeBanner 
        operatorName={businessName}
        stats={{
          newLeads: stats.newLeads,
          totalViews: stats.totalViews,
          reviewScore: stats.averageRating || undefined,
        }}
      />

      {/* Patriot Feed */}
      <PatriotFeed />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Intel Hits"
          value={stats.totalViews}
          subtitle="Views this week"
          icon={Eye}
          trend={stats.weeklyChange !== 0 ? { value: stats.weeklyChange, isPositive: stats.weeklyChange > 0 } : undefined}
          accentColor="accent"
        />
        <StatsCard
          title="Contacts"
          value={stats.newLeads}
          subtitle="New inquiries"
          icon={Users}
          accentColor="success"
        />
        <StatsCard
          title="Fleet Status"
          value={stats.fleetCount}
          subtitle="Rigs Mission Ready"
          icon={Truck}
          accentColor="primary"
        />
        <StatsCard
          title="Field Reports"
          value={stats.averageRating ? `${stats.averageRating}★` : 'N/A'}
          subtitle="Average rating"
          icon={Star}
          accentColor="gold"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
          <RecentContacts />
        </div>

        {/* Center Column - Analytics Chart */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Your Numbers
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Views
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Contacts
                </span>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215 85% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(215 85% 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="views"
                    stroke="hsl(215 85% 50%)"
                    strokeWidth={2}
                    fill="url(#viewsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(0 75% 45%)"
                    strokeWidth={2}
                    fill="url(#leadsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Field Reports */}
        <div className="lg:col-span-1">
          <FieldReportsWidget />
        </div>
      </div>
    </div>
  );
}
