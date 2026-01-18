import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Shield,
  Award,
  Search,
  Check,
  ChevronsUpDown,
  Filter,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface BadgeVerification {
  id: string;
  listing_id: string;
  badge_key: string;
  document_type: string;
  document_path: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  business_listings?: {
    business_name: string;
    owner_name: string | null;
  };
}

interface BadgeDefinition {
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ListingRow {
  id: string;
  business_name: string;
}

interface ActiveBadgeListing {
  id: string;
  business_name: string;
  owner_name: string | null;
  operator_badges: {
    badge_key: string;
    earned_at: string;
  }[];
}

export default function AdminBadges() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<BadgeVerification[]>([]);
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<BadgeVerification | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [selectedBadgeKey, setSelectedBadgeKey] = useState('');
  const [activeBadgeListings, setActiveBadgeListings] = useState<ActiveBadgeListing[]>([]);
  const [managementSearch, setManagementSearch] = useState('');
  const [currentTab, setCurrentTab] = useState('requests');

  // Removal reason state
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);
  const [pendingRemovalListingId, setPendingRemovalListingId] = useState('');
  const [pendingRemovalBadgeKey, setPendingRemovalBadgeKey] = useState('');
  const [removalReason, setRemovalReason] = useState('');

  const fetchData = async () => {
    setLoading(true);

    // Fetch badge definitions
    const { data: badgeData } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('display_order');

    if (badgeData) {
      setBadges(badgeData);
    }

    // Fetch verifications with business info
    let query = supabase
      .from('badge_verifications')
      .select(`
        *,
        business_listings (
          business_name,
          owner_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: verificationData, error } = await query;

    if (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verification requests');
    } else {
      setVerifications(verificationData as BadgeVerification[]);
    }

    // Fetch all listings for manual assignment
    const { data: listingData } = await supabase
      .from('business_listings')
      .select('id, business_name')
      .order('business_name');

    if (listingData) {
      setListings(listingData);
    }

    // Fetch listings with active badges
    const { data: activeData } = await supabase
      .from('business_listings')
      .select(`
        id,
        business_name,
        owner_name,
        operator_badges (
          badge_key,
          earned_at
        )
      `)
      .not('operator_badges', 'is', null);

    if (activeData) {
      // Filter out listings that don't actually have badges (Supabase join can sometimes return empty arrays)
      const filteredActive = (activeData as any[]).filter(l => l.operator_badges && l.operator_badges.length > 0);
      setActiveBadgeListings(filteredActive as ActiveBadgeListing[]);
    }

    setLoading(false);
  };

  const sendBadgeNotification = async (listingId: string, title: string, message: string) => {
    try {
      console.log(`Sending notification to listing ${listingId}: ${title}`);
      const { data: business } = await supabase
        .from('business_listings')
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (business?.user_id) {
        const { error } = await supabase.from('notifications').insert({
          user_id: business.user_id,
          type: 'system_notification',
          title,
          message,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedVerification) return;

    setProcessing(true);
    try {
      // Update verification status
      const { error: updateError } = await supabase
        .from('badge_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedVerification.id);

      if (updateError) throw updateError;

      // Assign the badge to the operator
      const { error: badgeError } = await supabase
        .from('operator_badges')
        .upsert({
          listing_id: selectedVerification.listing_id,
          badge_key: selectedVerification.badge_key,
          is_active: true,
          earned_at: new Date().toISOString(),
          verified_by: user?.id,
        }, {
          onConflict: 'listing_id,badge_key',
        });

      if (badgeError) throw badgeError;

      const badgeName = getBadgeName(selectedVerification.badge_key);
      await sendBadgeNotification(
        selectedVerification.listing_id,
        "Badge Approved!",
        `Great news! Your request for the "${badgeName}" trust badge has been approved.`
      );

      toast.success('Badge approved and assigned');
      setReviewModalOpen(false);
      setSelectedVerification(null);
      fetchData();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve badge');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('badge_verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      const badgeName = getBadgeName(selectedVerification.badge_key);
      await sendBadgeNotification(
        selectedVerification.listing_id,
        "Badge Verification Update",
        `Your request for the "${badgeName}" badge was not approved. Reason: ${rejectionReason}`
      );

      toast.success('Verification rejected');
      setReviewModalOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedListingId || !selectedBadgeKey) {
      toast.error('Select both an operator and a badge');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('operator_badges')
        .upsert({
          listing_id: selectedListingId,
          badge_key: selectedBadgeKey,
          is_active: true,
          earned_at: new Date().toISOString(),
          verification_notes: 'Manually assigned by administrator',
          verified_by: user?.id,
        }, {
          onConflict: 'listing_id,badge_key',
        });

      if (error) throw error;

      const badgeName = getBadgeName(selectedBadgeKey);
      await sendBadgeNotification(
        selectedListingId,
        "A Premium Badge was Awarded to You!",
        `Congratulations! You've been manually awarded the "${badgeName}" trust badge for your exceptional standing.`
      );

      toast.success('Badge assigned successfully');
      setAssignModalOpen(false);
      setSelectedListingId('');
      setSelectedBadgeKey('');
      fetchData();
    } catch (error: any) {
      console.error('Assignment error:', error);
      const errorMsg = error?.message || 'Failed to assign badge';
      toast.error(`Failed: ${errorMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveBadge = (listingId: string, badgeKey: string) => {
    setPendingRemovalListingId(listingId);
    setPendingRemovalBadgeKey(badgeKey);
    setRemovalReason('');
    setIsRemovalDialogOpen(true);
  };

  const confirmRemoveBadge = async () => {
    if (!removalReason.trim()) {
      toast.error('Please provide a reason for removal');
      return;
    }

    setProcessing(true);
    try {
      console.log(`Actually deleting badge ${pendingRemovalBadgeKey} for listing ${pendingRemovalListingId}`);

      // Delete the badge assignment
      const { error } = await supabase
        .from('operator_badges')
        .delete()
        .eq('listing_id', pendingRemovalListingId)
        .eq('badge_key', pendingRemovalBadgeKey);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      // Send notification with reason
      const badgeName = getBadgeName(pendingRemovalBadgeKey);
      await sendBadgeNotification(
        pendingRemovalListingId,
        "Badge Removed",
        `The "${badgeName}" badge has been removed from your profile. Reason: ${removalReason}`
      );

      toast.success('Badge removed successfully');
      setIsRemovalDialogOpen(false);
      setPendingRemovalListingId('');
      setPendingRemovalBadgeKey('');
      setRemovalReason('');
      fetchData();
    } catch (error: any) {
      console.error('Removal error:', error);
      toast.error(`Failed to remove badge: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentUrl = (path: string) => {
    const { data } = supabase.storage
      .from('business-photos')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const getBadgeName = (key: string) => {
    const badge = badges.find(b => b.badge_key === key);
    return badge?.name || key;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (!searchQuery) return true;
    const businessName = v.business_listings?.business_name?.toLowerCase() || '';
    const ownerName = v.business_listings?.owner_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return businessName.includes(query) || ownerName.includes(query);
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  const filteredActiveListings = activeBadgeListings.filter(l => {
    if (!managementSearch) return true;
    const businessName = l.business_name?.toLowerCase() || '';
    const ownerName = l.owner_name?.toLowerCase() || '';
    const query = managementSearch.toLowerCase();
    return businessName.includes(query) || ownerName.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Badge Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve badge verification submissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setAssignModalOpen(true)}>
            <Award className="h-4 w-4 mr-2" />
            Manual Assignment
          </Button>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500 text-white px-3 py-1">
              {pendingCount} Pending Review
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifications.filter(v => v.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifications.filter(v => v.status === 'approved').length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifications.filter(v => v.status === 'rejected').length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{badges.length}</p>
                <p className="text-sm text-muted-foreground">Badge Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
          <TabsTrigger value="requests" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase font-bold text-xs tracking-widest px-6 italic">
            Verification Requests
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase font-bold text-xs tracking-widest px-6 italic">
            Manage Active Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <Card className="bg-[#0A0F1C] border-white/10">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0F1C] border-white/10 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Verifications Table */}
          <Card className="bg-[#0A0F1C] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-red-500" />
                Verification Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : filteredVerifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Business</TableHead>
                      <TableHead className="text-gray-400">Badge</TableHead>
                      <TableHead className="text-gray-400">Document Type</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifications.map((verification) => (
                      <TableRow key={verification.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-bold text-white">{verification.business_listings?.business_name}</p>
                            <p className="text-sm text-gray-400">{verification.business_listings?.owner_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-red-600/10 text-red-500 border-red-600/20 font-bold uppercase tracking-tight italic">
                            {getBadgeName(verification.badge_key)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{verification.document_type}</TableCell>
                        <TableCell className="text-gray-300">
                          {format(new Date(verification.submitted_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setReviewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Active Badges Search */}
          <Card className="bg-[#0A0F1C] border-white/10">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search business to manage badges..."
                  value={managementSearch}
                  onChange={(e) => setManagementSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Badges Table */}
          <Card className="bg-[#0A0F1C] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-red-500" />
                Active Badge Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : filteredActiveListings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active badge assignments found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Business</TableHead>
                      <TableHead className="text-gray-400">Active Badges</TableHead>
                      <TableHead className="text-right text-gray-400">Control</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActiveListings.map((listing) => (
                      <TableRow key={listing.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="align-top py-4">
                          <div>
                            <p className="font-bold text-white">{listing.business_name}</p>
                            <p className="text-sm text-gray-400">{listing.owner_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-2">
                            {listing.operator_badges.map((ob) => (
                              <div
                                key={ob.badge_key}
                                className="group/badge-item relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white uppercase italic tracking-tight">
                                    {getBadgeName(ob.badge_key)}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    Awarded: {format(new Date(ob.earned_at), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-red-500/10 ml-2"
                                  onClick={() => handleRemoveBadge(listing.id, ob.badge_key)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-top py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              setSelectedListingId(listing.id);
                              setAssignModalOpen(true);
                            }}
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Add More
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Badge Verification</DialogTitle>
            <DialogDescription>
              Review the submitted document and approve or reject this badge request.
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business</p>
                  <p className="font-semibold">{selectedVerification.business_listings?.business_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Badge Requested</p>
                  <Badge variant="secondary">{getBadgeName(selectedVerification.badge_key)}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Document Type</p>
                  <p>{selectedVerification.document_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                  {getStatusBadge(selectedVerification.status)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Submitted Document</p>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  {selectedVerification.document_path.endsWith('.pdf') ? (
                    <div className="p-4 text-center">
                      <a
                        href={getDocumentUrl(selectedVerification.document_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View PDF Document
                      </a>
                    </div>
                  ) : (
                    <img
                      src={getDocumentUrl(selectedVerification.document_path)}
                      alt="Verification document"
                      className="w-full max-h-96 object-contain"
                    />
                  )}
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Rejection Reason (required if rejecting)
                  </p>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {selectedVerification.status === 'rejected' && selectedVerification.rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {selectedVerification.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => {
                setReviewModalOpen(false);
                setSelectedVerification(null);
                setRejectionReason('');
              }}
            >
              Close
            </Button>
            {selectedVerification?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-[#0A0F1C] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Manual Badge Assignment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Directly award a badge to an operator listing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Operator</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                      !selectedListingId && "text-muted-foreground"
                    )}
                  >
                    {selectedListingId
                      ? listings.find((l) => l.id === selectedListingId)?.business_name
                      : "Search for operator..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-[#0A0F1C] border-white/10 shadow-2xl">
                  <Command className="bg-transparent text-white">
                    <CommandInput placeholder="Type operator name..." className="h-9 text-white" />
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-gray-500">No operator found.</CommandEmpty>
                      <CommandGroup>
                        {listings.map((l) => (
                          <CommandItem
                            key={l.id}
                            value={l.business_name}
                            onSelect={() => {
                              setSelectedListingId(l.id);
                            }}
                            className="text-white hover:bg-white/5 aria-selected:bg-white/10 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedListingId === l.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {l.business_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Badge</label>
              <Select value={selectedBadgeKey} onValueChange={setSelectedBadgeKey}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a badge..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0F1C] border-white/10 text-white">
                  {badges.map((b) => (
                    <SelectItem key={b.badge_key} value={b.badge_key} className="focus:bg-white/10 focus:text-white">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              className="bg-[#374151] hover:bg-[#4B5563] text-white border-white/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic tracking-wider px-8"
              onClick={handleManualAssign}
              disabled={processing || !selectedListingId || !selectedBadgeKey}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
              ) : (
                <Award className="h-4 w-4 mr-2 text-white" />
              )}
              Assign Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removal Reason Dialog */}
      <Dialog open={isRemovalDialogOpen} onOpenChange={setIsRemovalDialogOpen}>
        <DialogContent className="bg-[#0A0F1C] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reason for Badge Removal</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please provide a brief explanation. This will be sent as a notification to the operator.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="e.g., Insurance documentation has expired, or safety violations reported."
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemovalDialogOpen(false)}
              className="bg-[#374151] hover:bg-[#4B5563] text-white border-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveBadge}
              disabled={processing || !removalReason.trim()}
              className="font-bold uppercase tracking-wider"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Removal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}