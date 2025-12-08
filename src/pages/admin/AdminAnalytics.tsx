import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  dailyLeads: { date: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  monthlyGrowth: { month: string; users: number; listings: number }[];
}

const COLORS = ['hsl(234, 89%, 73%)', 'hsl(255, 91%, 76%)', 'hsl(270, 95%, 75%)', 'hsl(238, 83%, 66%)', 'hsl(0, 0%, 45%)'];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    dailyLeads: [],
    categoryDistribution: [],
    statusDistribution: [],
    monthlyGrowth: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch leads for daily chart
        const { data: leads } = await supabase
          .from('leads')
          .select('created_at, status')
          .order('created_at', { ascending: true });

        // Fetch listings for category distribution
        const { data: listings } = await supabase
          .from('business_listings')
          .select('category, created_at');

        // Fetch users for growth chart
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at');

        // Process daily leads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyLeadsMap: Record<string, number> = {};
        leads?.forEach((lead) => {
          const date = new Date(lead.created_at).toISOString().split('T')[0];
          if (new Date(date) >= thirtyDaysAgo) {
            dailyLeadsMap[date] = (dailyLeadsMap[date] || 0) + 1;
          }
        });

        const dailyLeads = Object.entries(dailyLeadsMap).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count,
        }));

        // Process category distribution
        const categoryMap: Record<string, number> = {};
        listings?.forEach((listing) => {
          categoryMap[listing.category] = (categoryMap[listing.category] || 0) + 1;
        });

        const categoryDistribution = Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count,
        }));

        // Process status distribution
        const statusMap: Record<string, number> = {};
        leads?.forEach((lead) => {
          statusMap[lead.status] = (statusMap[lead.status] || 0) + 1;
        });

        const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }));

        // Process monthly growth (last 6 months)
        const monthlyGrowth: { month: string; users: number; listings: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const usersCount = profiles?.filter((p) => {
            const created = new Date(p.created_at);
            return created >= monthStart && created <= monthEnd;
          }).length || 0;

          const listingsCount = listings?.filter((l) => {
            const created = new Date(l.created_at);
            return created >= monthStart && created <= monthEnd;
          }).length || 0;

          monthlyGrowth.push({ month: monthStr, users: usersCount, listings: listingsCount });
        }

        setData({
          dailyLeads,
          categoryDistribution,
          statusDistribution,
          monthlyGrowth,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights and metrics across the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Leads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Leads (Last 30 Days)</CardTitle>
            <CardDescription>Quote requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyLeads}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
            <CardDescription>Distribution of business types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Current status of all leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="status" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
            <CardDescription>New users and listings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Users" />
                  <Line type="monotone" dataKey="listings" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} name="Listings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
