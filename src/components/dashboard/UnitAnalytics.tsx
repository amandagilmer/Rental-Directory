import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

export default function UnitAnalytics({ serviceId, serviceName }: UnitAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    conversionRate: 0
  });
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

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
        
        setStats({
          totalViews: views,
          totalInquiries: inquiries,
          conversionRate: views > 0 ? (inquiries / views) * 100 : 0
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

        interactions.forEach(interaction => {
          const day = format(new Date(interaction.created_at), 'yyyy-MM-dd');
          const current = dailyMap.get(day);
          if (current) {
            if (interaction.interaction_type === 'unit_view') {
              current.views++;
            } else if (interaction.interaction_type === 'unit_inquiry' || interaction.interaction_type === 'form_submit') {
              current.inquiries++;
            }
          }
        });

        const chartData = Array.from(dailyMap.entries()).map(([date, data]) => ({
          date: format(new Date(date), 'MMM d'),
          views: data.views,
          inquiries: data.inquiries
        }));

        setDailyData(chartData);
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground">Analytics for {serviceName}</h4>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Views</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats.totalViews}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Inquiries</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats.totalInquiries}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Conversion</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      {dailyData.length > 0 && (stats.totalViews > 0 || stats.totalInquiries > 0) && (
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-2">Last 30 Days</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} width={20} />
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
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
              <span className="text-xs text-muted-foreground">Inquiries</span>
            </div>
          </div>
        </div>
      )}

      {stats.totalViews === 0 && stats.totalInquiries === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No analytics data yet. Stats will appear once customers view this unit.
        </p>
      )}
    </div>
  );
}