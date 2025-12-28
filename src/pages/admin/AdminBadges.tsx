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
  Search
} from 'lucide-react';
import { format } from 'date-fns';

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

export default function AdminBadges() {
  const [verifications, setVerifications] = useState<BadgeVerification[]>([]);
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<BadgeVerification | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');

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

    setLoading(false);
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
        }, {
          onConflict: 'listing_id,badge_key',
        });

      if (badgeError) throw badgeError;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Badge Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve badge verification submissions
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-500 text-white px-3 py-1">
            {pendingCount} Pending Review
          </Badge>
        )}
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by business name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No verification requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{verification.business_listings?.business_name}</p>
                        <p className="text-sm text-muted-foreground">{verification.business_listings?.owner_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getBadgeName(verification.badge_key)}</Badge>
                    </TableCell>
                    <TableCell>{verification.document_type}</TableCell>
                    <TableCell>
                      {format(new Date(verification.submitted_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(verification.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
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
    </div>
  );
}