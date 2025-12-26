import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link2, Plus, ExternalLink, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TriggerLink {
  id: string;
  code: string;
  link_type: string;
  destination: string;
  click_count: number;
  created_at: string;
}

interface BusinessListing {
  id: string;
  business_name: string;
  phone: string | null;
}

export default function TriggerLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<TriggerLink[]>([]);
  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLinkType, setNewLinkType] = useState<string>('profile');

  const baseUrl = window.location.origin;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch user's listing
    const { data: listingData } = await supabase
      .from('business_listings')
      .select('id, business_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();

    if (listingData) {
      setListing(listingData);

      // Fetch trigger links
      const { data: linksData } = await supabase
        .from('trigger_links')
        .select('*')
        .eq('host_id', listingData.id)
        .order('created_at', { ascending: false });

      if (linksData) {
        setLinks(linksData);
      }
    }

    setLoading(false);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createLink = async () => {
    if (!listing) return;

    setCreating(true);
    const code = generateCode();

    // Determine destination based on link type
    let destination = '';
    const slug = listing.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    switch (newLinkType) {
      case 'profile':
        destination = `${baseUrl}/business/${slug}`;
        break;
      case 'call':
        destination = `tel:${listing.phone || ''}`;
        break;
      case 'form':
        destination = `${baseUrl}/business/${slug}#contact`;
        break;
    }

    const { error } = await supabase
      .from('trigger_links')
      .insert({
        host_id: listing.id,
        code,
        link_type: newLinkType,
        destination
      });

    if (error) {
      toast({
        title: 'Failed to create link',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Link created!',
        description: 'Your new tracking link is ready to use.'
      });
      fetchData();
    }

    setCreating(false);
  };

  const copyLink = (code: string) => {
    const link = `${baseUrl}/go/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied!',
      description: 'The tracking link has been copied to your clipboard.'
    });
  };

  const getLinkTypeIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <ExternalLink className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'form':
        return <FileText className="h-4 w-4" />;
      default:
        return <Link2 className="h-4 w-4" />;
    }
  };

  const getLinkTypeName = (type: string) => {
    switch (type) {
      case 'profile':
        return 'Profile View';
      case 'call':
        return 'Click-to-Call';
      case 'form':
        return 'Contact Form';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    );
  }

  if (!listing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Listing Found</CardTitle>
          <CardDescription>
            You need to create a business listing before you can generate tracking links.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tracking Links</h1>
        <p className="text-muted-foreground mt-1">
          Create unique tracking links for your marketing campaigns. Monitor clicks and conversions.
        </p>
      </div>

      {/* Create New Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate New Link
          </CardTitle>
          <CardDescription>
            Create a new trackable URL for your marketing efforts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="linkType">Link Type</Label>
              <Select value={newLinkType} onValueChange={setNewLinkType}>
                <SelectTrigger id="linkType" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile View</SelectItem>
                  <SelectItem value="call">Click-to-Call</SelectItem>
                  <SelectItem value="form">Contact Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={createLink} disabled={creating}>
                {creating ? 'Creating...' : 'Generate Link'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tracking Links</CardTitle>
          <CardDescription>
            Use these links in your marketing. Every click is tracked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No tracking links yet. Create your first one above!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm">
                      {baseUrl}/go/{link.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLinkTypeIcon(link.link_type)}
                        {getLinkTypeName(link.link_type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {link.click_count}
                    </TableCell>
                    <TableCell>
                      {format(new Date(link.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(link.code)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use <strong>Profile</strong> links in ads and social media posts</p>
          <p>• Use <strong>Click-to-Call</strong> links in email signatures and flyers</p>
          <p>• Use <strong>Contact Form</strong> links when you want to capture lead details</p>
          <p>• Track which marketing channels perform best by creating separate links for each</p>
        </CardContent>
      </Card>
    </div>
  );
}