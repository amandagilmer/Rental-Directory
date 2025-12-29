import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Mail, Users, TrendingUp, Target, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface MarketingLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  marketing_consent: boolean;
  customer_segment: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  total_inquiries: number;
}

interface MarketingUser {
  id: string;
  email: string;
  business_name: string | null;
  user_type: string;
  marketing_consent: boolean;
  signup_source: string | null;
  created_at: string;
}

export default function AdminMarketing() {
  const [leads, setLeads] = useState<MarketingLead[]>([]);
  const [users, setUsers] = useState<MarketingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      // Fetch leads with marketing data
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email, phone, status, marketing_consent, customer_segment, utm_source, utm_medium, utm_campaign, created_at, total_inquiries')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch users/profiles with marketing data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, business_name, user_type, marketing_consent, signup_source, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setLeads((leadsData || []) as MarketingLead[]);
      setUsers((usersData || []) as MarketingUser[]);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = segmentFilter === 'all' || lead.customer_segment === segmentFilter;
    const matchesConsent = consentFilter === 'all' || 
      (consentFilter === 'opted_in' && lead.marketing_consent) ||
      (consentFilter === 'opted_out' && !lead.marketing_consent);

    return matchesSearch && matchesSegment && matchesConsent;
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
    const matchesConsent = consentFilter === 'all' || 
      (consentFilter === 'opted_in' && user.marketing_consent) ||
      (consentFilter === 'opted_out' && !user.marketing_consent);

    return matchesSearch && matchesType && matchesConsent;
  });

  // Export to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`Exported ${data.length} records`);
  };

  // Stats calculations
  const optedInLeads = leads.filter(l => l.marketing_consent).length;
  const optedInUsers = users.filter(u => u.marketing_consent).length;
  const renterCount = users.filter(u => u.user_type === 'renter').length;
  const hostCount = users.filter(u => u.user_type === 'host').length;
  const utmSources = [...new Set(leads.filter(l => l.utm_source).map(l => l.utm_source))];

  const getSegmentBadge = (segment: string) => {
    const colors: Record<string, string> = {
      new_inquiry: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      repeat_customer: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      high_value: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      converted: 'bg-green-500/10 text-green-500 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };

    return (
      <Badge className={colors[segment] || 'bg-muted'} variant="outline">
        {segment?.replace('_', ' ') || 'Unknown'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
        </div>
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Hub</h1>
        <p className="text-muted-foreground mt-1">Manage audiences and remarketing campaigns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{optedInLeads}</div>
                <p className="text-sm text-muted-foreground">Opted-In Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{hostCount}</div>
                <p className="text-sm text-muted-foreground">Hosts (Businesses)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{renterCount}</div>
                <p className="text-sm text-muted-foreground">Renters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{utmSources.length}</div>
                <p className="text-sm text-muted-foreground">Traffic Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Leads vs Users */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Renter Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="users">Registered Users ({users.length})</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Renter Leads</CardTitle>
                  <CardDescription>People who submitted quote requests - potential remarketing audience</CardDescription>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      <SelectItem value="new_inquiry">New Inquiry</SelectItem>
                      <SelectItem value="repeat_customer">Repeat Customer</SelectItem>
                      <SelectItem value="high_value">High Value</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={consentFilter} onValueChange={setConsentFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Consent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="opted_in">Opted In</SelectItem>
                      <SelectItem value="opted_out">Not Opted In</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV(
                      filteredLeads.filter(l => l.marketing_consent).map(l => ({
                        name: l.name,
                        email: l.email,
                        phone: l.phone,
                        segment: l.customer_segment,
                        source: l.utm_source,
                        created: l.created_at
                      })),
                      'opted_in_leads'
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Opted-In
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Inquiries</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.slice(0, 50).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getSegmentBadge(lead.customer_segment)}</TableCell>
                      <TableCell>
                        {lead.utm_source ? (
                          <Badge variant="outline">{lead.utm_source}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Direct</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.marketing_consent ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                            Opted In
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{lead.total_inquiries || 1}</TableCell>
                      <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No leads found matching your criteria
                </div>
              )}
              {filteredLeads.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 50 of {filteredLeads.length} results. Export for full list.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>Hosts and renters who created accounts</CardDescription>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="host">Hosts</SelectItem>
                      <SelectItem value="renter">Renters</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV(
                      filteredUsers.map(u => ({
                        email: u.email,
                        business_name: u.business_name,
                        user_type: u.user_type,
                        signup_source: u.signup_source,
                        marketing_consent: u.marketing_consent,
                        created: u.created_at
                      })),
                      'users'
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Marketing</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.slice(0, 50).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.business_name || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={user.user_type === 'host' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }
                        >
                          {user.user_type || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.signup_source ? (
                          <Badge variant="outline">{user.signup_source}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Direct</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.marketing_consent ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources Analysis</CardTitle>
              <CardDescription>Where your leads and users are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UTM Sources */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Lead Sources (UTM)</h3>
                  {utmSources.length > 0 ? (
                    <div className="space-y-2">
                      {utmSources.map(source => {
                        const count = leads.filter(l => l.utm_source === source).length;
                        const percentage = Math.round((count / leads.length) * 100);
                        return (
                          <div key={source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <span className="font-medium">{source}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-16 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No UTM tracking data yet</p>
                  )}
                </div>

                {/* Signup Sources */}
                <div className="space-y-4">
                  <h3 className="font-semibold">User Signup Sources</h3>
                  {(() => {
                    const sources = [...new Set(users.filter(u => u.signup_source).map(u => u.signup_source))];
                    return sources.length > 0 ? (
                      <div className="space-y-2">
                        {sources.map(source => {
                          const count = users.filter(u => u.signup_source === source).length;
                          const percentage = Math.round((count / users.length) * 100);
                          return (
                            <div key={source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <span className="font-medium">{source}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-16 text-right">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No source tracking data yet</p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}