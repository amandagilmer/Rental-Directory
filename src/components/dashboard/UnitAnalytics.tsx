import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, TrendingUp, Loader2, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface UnitAnalyticsProps {
  serviceId: string;
  serviceName: string;
}

interface DailyStats {
  date: string;
  views: number;
  inquiries: number;
}

interface HourlyHeatmap {
  hour: number;
  count: number;
}

export default function UnitAnalytics({ serviceId, serviceName }: UnitAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    conversionRate: 0,
    thisWeekViews: 0,
    lastWeekViews: 0,
    weekChange: 0
  });
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyHeatmap[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const fourteenDaysAgo = subDays(new Date(), 14).toISOString();

      // Fetch interactions for this unit
      const { data: interactions } = await supabase
        .from('interactions')
        .select('interaction_type, created_at')
        .eq('service_id', serviceId)
        .gte('created_at', thirtyDaysAgo);

      if (interactions) {
        const views = interactions.filter(i => i.interaction_type === 'unit_view').length;
        const inquiries = interactions.filter(i => 
          i.interaction_type === 'unit_inquiry' || i.interaction_type === 'form_submit'
        ).length;

        // Calculate week-over-week
        const thisWeekViews = interactions.filter(i => 
          i.interaction_type === 'unit_view' && new Date(i.created_at) >= new Date(sevenDaysAgo)
        ).length;
        const lastWeekViews = interactions.filter(i => {
          const date = new Date(i.created_at);
          return i.interaction_type === 'unit_view' && 
                 date >= new Date(fourteenDaysAgo) && 
                 date < new Date(sevenDaysAgo);
        }).length;

        const weekChange = lastWeekViews > 0 
          ? ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100 
          : 0;
        
        setStats({
          totalViews: views,
          totalInquiries: inquiries,
          conversionRate: views > 0 ? (inquiries / views) * 100 : 0,
          thisWeekViews,
          lastWeekViews,
          weekChange
        });

        // Build daily data
        const days = eachDayOfInterval({
          start: subDays(new Date(), 30),
          end: new Date()
        });

        const dailyMap = new Map<string, { views: number; inquiries: number }>();
        days.forEach(day => {
          dailyMap.set(format(day, 'yyyy-MM-dd'), { views: 0, inquiries: 0 });
        });

        // Build hourly heatmap
        const hourlyMap = new Map<number, number>();
        for (let i = 0; i < 24; i++) {
          hourlyMap.set(i, 0);
        }

        interactions.forEach(interaction => {
          const day = format(new Date(interaction.created_at), 'yyyy-MM-dd');
          const hour = new Date(interaction.created_at).getHours();
          
          const current = dailyMap.get(day);
          if (current) {
            if (interaction.interaction_type === 'unit_view') {
              current.views++;
            } else if (interaction.interaction_type === 'unit_inquiry' || interaction.interaction_type === 'form_submit') {
              current.inquiries++;
            }
          }

          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        });

        const chartData = Array.from(dailyMap.entries()).map(([date, data]) => ({
          date: format(new Date(date), 'MMM d'),
          views: data.views,
          inquiries: data.inquiries
        }));

        const heatmapData = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
          hour,
          count
        }));

        setDailyData(chartData);
        setHourlyData(heatmapData);
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-white/50" />
      </div>
    );
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-white/70">Analytics for {serviceName}</h4>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs text-white/70">Views</span>
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">{stats.totalViews}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-xs text-white/70">Inquiries</span>
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">{stats.totalInquiries}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-white/70">Conversion</span>
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">{stats.conversionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            {stats.weekChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-white/70">Week Trend</span>
          </div>
          <p className={`text-xl font-bold mt-1 ${stats.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.weekChange >= 0 ? '+' : ''}{stats.weekChange.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      {dailyData.length > 0 && (stats.totalViews > 0 || stats.totalInquiries > 0) && (
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-white/70 mb-2">Last 30 Days</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} width={20} />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 12,
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="inquiries" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-white/70">Views</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
              <span className="text-xs text-white/70">Inquiries</span>
            </div>
          </div>
        </div>
      )}

      {/* Peak Hours Heatmap */}
      {hourlyData.some(h => h.count > 0) && (
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-white/70 mb-2">Peak Activity Hours</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData.filter((_, i) => i % 3 === 0)}>
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHour}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Interactions']}
                  labelFormatter={(hour: number) => formatHour(hour)}
                  contentStyle={{ 
                    fontSize: 11,
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.totalViews === 0 && stats.totalInquiries === 0 && (
        <p className="text-xs text-white/60 text-center py-2">
          No analytics data yet. Stats will appear once customers view this unit.
        </p>
      )}
    </div>
  );
}
