import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from('business_listings')
        .select('id, business_name')
        .eq('user_id', user.id);

      if (listingsData && listingsData.length > 0) {
        const listingIds = listingsData.map(l => l.id);
        
        // Fetch analytics for those listings
        const { data: analyticsData } = await supabase
          .from('listing_analytics')
          .select('*')
          .in('listing_id', listingIds)
          .order('date', { ascending: false });

        if (analyticsData) {
          // Combine with listing names
          const enrichedData = analyticsData.map(a => ({
            ...a,
            business_name: listingsData.find(l => l.id === a.listing_id)?.business_name || 'Unknown'
          }));
          
          setAnalytics(enrichedData);
        }
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track your listing performance</p>
      </div>

      {analytics.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No analytics data available yet. Create and publish a listing to start tracking views and impressions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {analytics.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.business_name}</CardTitle>
                <CardDescription>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="text-2xl font-bold">{item.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Search Impressions</p>
                    <p className="text-2xl font-bold">{item.search_impressions || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
