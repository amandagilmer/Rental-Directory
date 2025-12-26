import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Send, Loader2, CheckCircle, Clock, Users, Link2, Copy, ExternalLink, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface ReviewsRequestsTabProps {
  listingId: string;
}

export default function ReviewsRequestsTab({ listingId }: ReviewsRequestsTabProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    sentToday: 0,
    pendingResponses: 0,
    responseRate: 0
  });
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
  });
  const [smsForm, setSmsForm] = useState({
    name: '',
    phone: '',
  });

  // Generate a base review URL for embedding
  const baseUrl = window.location.origin;
  const reviewPageUrl = `${baseUrl}/review-landing/${listingId}`;

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count emails sent today
      const { count: sentCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', listingId)
        .eq('review_email_sent', true)
        .gte('review_email_sent_at', today.toISOString());

      // Count pending (sent but no review yet)
      const { data: sentLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('business_id', listingId)
        .eq('review_email_sent', true);

      const sentIds = sentLeads?.map(l => l.id) || [];
      
      let pendingCount = 0;
      let reviewedCount = 0;
      
      if (sentIds.length > 0) {
        const { count: reviewed } = await supabase
          .from('your_reviews')
          .select('*', { count: 'exact', head: true })
          .in('lead_id', sentIds);
        
        reviewedCount = reviewed || 0;
        pendingCount = sentIds.length - reviewedCount;
      }

      const responseRate = sentIds.length > 0 ? (reviewedCount / sentIds.length) * 100 : 0;

      setStats({
        sentToday: sentCount || 0,
        pendingResponses: pendingCount,
        responseRate
      });
    };

    fetchStats();
  }, [listingId]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.name.trim() || !emailForm.email.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both name and email',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-review-request', {
        body: {
          customerName: emailForm.name,
          customerEmail: emailForm.email,
          businessId: listingId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Request sent!',
        description: `Review request email sent to ${emailForm.email}`,
      });
      setEmailForm({ name: '', email: '' });
      
      // Refresh stats
      setStats(prev => ({ ...prev, sentToday: prev.sentToday + 1 }));
    } catch (error) {
      console.error('Error sending review request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send review request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!smsForm.name.trim() || !smsForm.phone.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both name and phone number',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Coming Soon',
      description: 'SMS review requests will be available soon!',
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const iframeCode = `<iframe src="${reviewPageUrl}" width="100%" height="500" frameborder="0" style="border-radius: 8px;"></iframe>`;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sentToday}</p>
                <p className="text-sm text-muted-foreground">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingResponses}</p>
                <p className="text-sm text-muted-foreground">Pending Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Review Request</CardTitle>
            <CardDescription>
              Manually send review requests to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="gap-2">
                  <Phone className="h-4 w-4" />
                  SMS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-name">Customer Name</Label>
                    <Input
                      id="email-name"
                      placeholder="John Smith"
                      value={emailForm.name}
                      onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="john@example.com"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email Request
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sms">
                <form onSubmit={handleSmsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-name">Customer Name</Label>
                    <Input
                      id="sms-name"
                      placeholder="John Smith"
                      value={smsForm.name}
                      onChange={(e) => setSmsForm({ ...smsForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={smsForm.phone}
                      onChange={(e) => setSmsForm({ ...smsForm, phone: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS Request
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Embeddable Review Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Review Links
            </CardTitle>
            <CardDescription>
              Share these links or embed them on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Direct Link */}
            <div className="space-y-2">
              <Label>Direct Review Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={reviewPageUrl}
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(reviewPageUrl, 'Link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => window.open(reviewPageUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with customers to collect reviews
              </p>
            </div>

            {/* Embed Code */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Embed Code
              </Label>
              <Textarea 
                readOnly 
                value={iframeCode}
                className="font-mono text-xs h-20"
              />
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => copyToClipboard(iframeCode, 'Embed code')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
              <p className="text-xs text-muted-foreground">
                Add this to your website to collect reviews directly
              </p>
            </div>

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-sm mb-2">Tips for Getting Reviews</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Send requests within 48 hours of service completion</li>
                <li>• Add the review link to your email signature</li>
                <li>• Include a QR code on receipts linking to reviews</li>
                <li>• Follow up once if no response</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
