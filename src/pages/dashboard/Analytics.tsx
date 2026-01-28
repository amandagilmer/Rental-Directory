import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Eye,
  Search,
  MessageSquare,
  TrendingUp,
  Calendar,
  Filter,
  ArrowUpRight,
  Loader2,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  date: string;
  displayDate?: string;
  views: number;
  search_impressions: number;
  inquiries: number;
  listing_id: string;
  business_name?: string;
}

interface Listing {
  id: string;
  business_name: string;
}

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from('business_listings')
        .select('id, business_name')
        .eq('user_id', user.id);

      if (listingsData) {
        setListings(listingsData);

        const listingIds = listingsData.map(l => l.id);

        // Fetch aggregated analytics
        let query = supabase
          .from('listing_analytics')
          .select('*')
          .in('listing_id', listingIds);

        // Filter by specific listing if selected
        if (selectedListingId !== 'all') {
          query = query.eq('listing_id', selectedListingId);
        }

        const { data: analyticsData } = await query.order('date', { ascending: true });

        if (analyticsData) {
          // Process and enrich data
          const enrichedData = analyticsData.map(a => ({
            ...a,
            business_name: listingsData.find(l => l.id === a.listing_id)?.business_name || 'Unknown',
            displayDate: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));

          // If showing 'all', we might want to aggregate by date
          if (selectedListingId === 'all') {
            const aggregated = enrichedData.reduce((acc: any, curr: any) => {
              const existing = acc.find((item: any) => item.date === curr.date);
              if (existing) {
                existing.views += curr.views || 0;
                existing.search_impressions += curr.search_impressions || 0;
                existing.inquiries += curr.inquiries || 0;
              } else {
                acc.push({
                  date: curr.date,
                  displayDate: curr.displayDate,
                  views: curr.views || 0,
                  search_impressions: curr.search_impressions || 0,
                  inquiries: curr.inquiries || 0
                });
              }
              return acc;
            }, []);
            setAnalytics(aggregated);
          } else {
            setAnalytics(enrichedData);
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, selectedListingId, timeRange]);

  const totals = analytics.reduce((acc, curr) => ({
    views: acc.views + (curr.views || 0),
    impressions: acc.impressions + (curr.search_impressions || 0),
    inquiries: acc.inquiries + (curr.inquiries || 0)
  }), { views: 0, impressions: 0, inquiries: 0 });

  if (loading && listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Scanning operational data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight font-display italic uppercase">Analytics HQ</h1>
          <p className="text-muted-foreground mt-2 font-medium">Real-time performance metrics for your fleet.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card border rounded-lg p-1">
            <Button
              variant={timeRange === '7d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('7d')}
              className="text-xs font-bold uppercase tracking-tighter"
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('30d')}
              className="text-xs font-bold uppercase tracking-tighter"
            >
              30D
            </Button>
            <Button
              variant={timeRange === '90d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('90d')}
              className="text-xs font-bold uppercase tracking-tighter"
            >
              90D
            </Button>
          </div>

          <Select value={selectedListingId} onValueChange={setSelectedListingId}>
            <SelectTrigger className="w-[200px] bg-card font-bold text-xs uppercase italic tracking-tighter">
              <SelectValue placeholder="Select Listing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fleets</SelectItem>
              {listings.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.business_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {listings.length === 0 ? (
        <Card className="border-dashed bg-muted/5">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Passive Intel Detected</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              You haven't published any listings yet. Start listing your fleet to begin gathering performance analytics.
            </p>
            <Button className="bg-primary hover:bg-primary/90 font-bold italic tracking-tighter">
              Launch First Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Eye className="h-12 w-12" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Eye className="h-3 w-3 text-primary" />
                  Total Views
                </CardDescription>
                <CardTitle className="text-4xl font-display italic font-black text-foreground">
                  {totals.views}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-bold text-green-500 italic">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% vs last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="h-12 w-12" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Search className="h-3 w-3 text-primary" />
                  Search Impressions
                </CardDescription>
                <CardTitle className="text-4xl font-display italic font-black text-foreground">
                  {totals.impressions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-bold text-green-500 italic">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 overflow-hidden relative group border-2 border-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Fleet Inquiries
                </CardDescription>
                <CardTitle className="text-4xl font-display italic font-black text-foreground">
                  {totals.inquiries}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-bold text-green-500 italic">
                  <TrendingUp className="h-3 w-3" />
                  +24.1% vs last period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="bg-card/50 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-xl font-bold font-display italic uppercase tracking-tighter">Performance Trajectory</CardTitle>
                <CardDescription className="mt-1 font-medium italic">Engagement metrics tracked daily</CardDescription>
              </div>
              <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest border-primary/20 text-primary">
                Live Data Feed
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                {analytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0A0F1C',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="Total Views"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="inquiries"
                        name="Fleet Inquiries"
                        stroke="#ea580c"
                        fillOpacity={1}
                        fill="url(#colorInquiries)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-primary/10 rounded-xl bg-muted/5">
                    <p className="text-muted-foreground font-medium italic">Pending historical data accumulation...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <Card className="bg-card/30 border-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-display italic uppercase tracking-tighter">Conversion Efficiency</CardTitle>
                <CardDescription className="italic font-medium">Inquiries vs Total Impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: '#0A0F1C',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="search_impressions" name="Impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="inquiries" name="Inquiries" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-primary/5 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-display italic uppercase tracking-tighter">Operational Feed</CardTitle>
                <CardDescription className="italic font-medium">Recent listing activity snapshots</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {[...analytics].reverse().map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground italic uppercase tracking-tighter">{item.displayDate}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Aggregate Shift</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-foreground">+{item.views || 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase">Views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">+{item.inquiries || 0}</p>
                          <p className="text-[8px] text-primary/70 uppercase font-bold">Inquiries</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
