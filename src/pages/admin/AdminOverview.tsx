import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, MessageSquare, Ticket, TrendingUp, Eye } from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  publishedListings: number;
  totalLeads: number;
  openTickets: number;
  totalViews: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalListings: 0,
    publishedListings: 0,
    totalLeads: 0,
    openTickets: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const [
          usersResult,
          listingsResult,
          publishedResult,
          leadsResult,
          ticketsResult,
          analyticsResult,
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('business_listings').select('*', { count: 'exact', head: true }),
          supabase.from('business_listings').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('listing_analytics').select('views'),
        ]);

        const totalViews = analyticsResult.data?.reduce((sum, row) => sum + (row.views || 0), 0) || 0;

        setStats({
          totalUsers: usersResult.count || 0,
          totalListings: listingsResult.count || 0,
          publishedListings: publishedResult.count || 0,
          totalLeads: leadsResult.count || 0,
          openTickets: ticketsResult.count || 0,
          totalViews,
        });

        // Fetch recent leads for activity
        const { data: recentLeads } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(recentLeads || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Total Listings', value: stats.totalListings, icon: Building2, color: 'text-green-500' },
    { title: 'Published Listings', value: stats.publishedListings, icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Total Leads', value: stats.totalLeads, icon: MessageSquare, color: 'text-purple-500' },
    { title: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: 'text-orange-500' },
    { title: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-cyan-500' },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest quote requests across all businesses</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{lead.service_type || 'General Inquiry'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
