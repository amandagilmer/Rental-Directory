import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Link as LinkIcon, CheckCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GmbConnection {
  id: string;
  account_email: string;
  connected_at: string;
  last_sync_at: string | null;
  sync_frequency: string;
  is_active: boolean;
}

export default function GmbSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<GmbConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchConnection();
    handleOAuthCallback();
  }, [user]);

  const handleOAuthCallback = async () => {
    if (!user) return;

    // Check if user has Google identity linked (from OAuth return)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const googleIdentity = currentUser?.identities?.find(
      (identity) => identity.provider === 'google'
    );

    if (googleIdentity) {
      // Check if we already have a connection stored
      const { data: existingConnection } = await supabase
        .from('gmb_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingConnection) {
        try {
          // Store the GMB connection
          const googleEmail = googleIdentity.identity_data?.email || user.email || '';
          const { error } = await supabase
            .from('gmb_connections')
            .insert({
              user_id: user.id,
              account_email: googleEmail,
              sync_frequency: 'daily',
              is_active: true,
            });

          if (error) throw error;

          toast({
            title: 'Connected!',
            description: 'Your Google My Business account has been connected successfully.',
          });

          // Clear any hash/query params from URL
          window.history.replaceState(null, '', window.location.pathname);
          fetchConnection();
        } catch (error: any) {
          console.error('Error storing GMB connection:', error);
          toast({
            title: 'Error',
            description: 'Failed to connect Google My Business account',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const fetchConnection = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('gmb_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error: any) {
      console.error('Error fetching GMB connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch GMB connection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    setConnecting(true);

    try {
      // Use linkIdentity to link Google account to existing user
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/business.manage',
          redirectTo: `${window.location.origin}/dashboard/gmb`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // The OAuth flow will redirect away, so this won't execute until return
    } catch (error: any) {
      console.error('Error connecting GMB:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate Google OAuth flow',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!user || !connection) return;
    setSyncing(true);

    try {
      // Mock sync - simulate pulling data from GMB
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock business data that would come from GMB
      const mockBusinesses = [
        {
          business_name: 'Main Street Coffee Shop',
          category: 'Restaurant',
          description: 'Cozy coffee shop serving artisan coffee and fresh pastries daily.',
          phone: '(555) 123-4567',
          email: 'contact@mainstreetcoffee.com',
          website: 'https://mainstreetcoffee.com',
          address: '123 Main St, Downtown',
          image_url: '/placeholder.svg',
        },
        {
          business_name: 'Tech Solutions Hub',
          category: 'Equipment',
          description: 'Professional IT equipment rental and tech support services.',
          phone: '(555) 987-6543',
          email: 'info@techsolutions.com',
          website: 'https://techsolutionshub.com',
          address: '456 Tech Avenue, Business District',
          image_url: '/placeholder.svg',
        },
      ];

      // Insert mock listings
      for (const business of mockBusinesses) {
        await supabase.from('business_listings').insert({
          user_id: user.id,
          ...business,
          is_published: true,
        });
      }

      // Update last sync time
      await supabase
        .from('gmb_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connection.id);

      toast({
        title: 'Sync Complete!',
        description: `Successfully synced ${mockBusinesses.length} business listings from Google My Business.`,
      });

      fetchConnection();
    } catch (error: any) {
      console.error('Error syncing GMB:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync Google My Business data',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase
        .from('gmb_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      toast({
        title: 'Disconnected',
        description: 'Your Google My Business account has been disconnected.',
      });

      setConnection(null);
    } catch (error: any) {
      console.error('Error disconnecting GMB:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect account',
        variant: 'destructive',
      });
    }
  };

  const updateSyncFrequency = async (frequency: string) => {
    if (!connection) return;

    try {
      const { error } = await supabase
        .from('gmb_connections')
        .update({ sync_frequency: frequency })
        .eq('id', connection.id);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: `Sync frequency updated to ${frequency}`,
      });

      fetchConnection();
    } catch (error: any) {
      console.error('Error updating sync frequency:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sync frequency',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Google My Business Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Google My Business account to automatically sync your listings
        </p>
      </div>

      {!connection ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Account</CardTitle>
            <CardDescription>
              Link your Google My Business account to automatically pull your business information,
              photos, ratings, and reviews into your directory listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full sm:w-auto"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Google My Business'}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              You'll be redirected to Google to authorize access to your Google My Business account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Connected Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                <p className="text-foreground">{connection.account_email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Since</p>
                <p className="text-foreground">
                  {new Date(connection.connected_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Last Sync</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {connection.last_sync_at
                      ? new Date(connection.last_sync_at).toLocaleString()
                      : 'Never synced'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Sync Frequency</p>
                <Select
                  value={connection.sync_frequency}
                  onValueChange={updateSyncFrequency}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Gets Synced</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Business name and contact information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Business category and description
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Location and address details
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Business photos and images
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Customer ratings and reviews
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}