import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Send, Loader2, CheckCircle, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewsRequestsTabProps {
  listingId: string;
}

export default function ReviewsRequestsTab({ listingId }: ReviewsRequestsTabProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
  });
  const [smsForm, setSmsForm] = useState({
    name: '',
    phone: '',
  });

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
      // Call the send-review-request edge function
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

    // SMS functionality would require a separate integration (Twilio, etc.)
    toast({
      title: 'Coming Soon',
      description: 'SMS review requests will be available soon!',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Send Review Request</CardTitle>
            <CardDescription>
              Ask your customers to leave a review for your business
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
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Email Preview:</strong>
                    </p>
                    <div className="text-sm space-y-2 border-l-2 border-primary pl-3">
                      <p>Hi {emailForm.name || '[Customer Name]'},</p>
                      <p>Thank you for choosing our services! We'd love to hear about your experience.</p>
                      <p>Would you take a moment to leave us a review?</p>
                      <p className="text-primary">[Review Link]</p>
                    </div>
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
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>SMS Preview:</strong>
                    </p>
                    <div className="text-sm border-l-2 border-primary pl-3">
                      <p>Hi {smsForm.name || '[Name]'}! Thank you for using our services. We'd love your feedback! Leave us a review: [link]</p>
                    </div>
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
      </div>

      {/* Stats Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Requests Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pending Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tips for Getting Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• Send requests within 24 hours of service</li>
              <li>• Personalize your message with their name</li>
              <li>• Keep the review process simple</li>
              <li>• Follow up once if no response</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
