import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Eye, TrendingUp } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalImpressions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch listings count
      const { count: listingsCount } = await supabase
        .from('business_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch analytics
      const { data: listingsData } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', user.id);

      if (listingsData && listingsData.length > 0) {
        const listingIds = listingsData.map(l => l.id);
        
        const { data: analyticsData } = await supabase
          .from('listing_analytics')
          .select('views, search_impressions')
          .in('listing_id', listingIds);

        if (analyticsData) {
          const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
          const totalImpressions = analyticsData.reduce((sum, a) => sum + (a.search_impressions || 0), 0);
          
          setStats({
            totalListings: listingsCount || 0,
            totalViews,
            totalImpressions
          });
        }
      } else {
        setStats({
          totalListings: listingsCount || 0,
          totalViews: 0,
          totalImpressions: 0
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          {profile?.business_name || 'Your business'} - {profile?.location}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">Active business listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Listing detail views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Impressions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImpressions}</div>
            <p className="text-xs text-muted-foreground">Appeared in search results</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your rental business presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Update your business listing to attract more customers
          </p>
          <p className="text-sm text-muted-foreground">
            • Check your analytics to see how customers find you
          </p>
          <p className="text-sm text-muted-foreground">
            • Manage your account settings and preferences
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
