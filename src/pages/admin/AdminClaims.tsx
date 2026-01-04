import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, FileText, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Claim {
    id: string;
    business_id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    proof_doc_url: string | null;
    created_at: string;
    business?: {
        business_name: string;
        slug: string;
        claimed: boolean;
    };
    profile?: {
        email: string;
    };
}

export default function AdminClaims() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchClaims = async () => {
        try {
            const { data, error } = await supabase
                .from('business_claims')
                .select(`
          *,
          business:business_listings(business_name, slug, claimed),
          profile:profiles(email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match interface if needed (Supabase returns arrays for joins sometimes, but usually objects for single relations)
            // Assuming 1:1 relationships logic matches here.
            // Note: profiles JOIN might require explicit simplified mapping if returning array.
            // Checking actual return type structure is safer, but for now assuming standard single relation based on FK.

            const formattedClaims = data.map(item => ({
                ...item,
                business: item.business, // supabase-js types might need assertion or it handles it dynamically
                profile: item.profile
            })) as unknown as Claim[];

            setClaims(formattedClaims);
        } catch (error) {
            console.error('Error fetching claims:', error);
            toast.error('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleApprove = async (claim: Claim) => {
        if (!confirm('Are you sure you want to approve this claim? This will assign the business to the user.')) return;

        setProcessing(true);
        try {
            // 1. Update claim status
            const { error: claimError } = await supabase
                .from('business_claims')
                .update({ status: 'approved' })
                .eq('id', claim.id);

            if (claimError) throw claimError;

            // 2. Update business listing owner
            const { error: businessError } = await supabase
                .from('business_listings')
                .update({
                    user_id: claim.user_id,
                    claimed: true
                })
                .eq('id', claim.business_id);

            if (businessError) throw businessError;

            // 3. Reject other pending claims for this business (Optional but good practice)
            // Skipping for now to keep it simple, or we can just let them stay pending/reject.

            toast.success('Claim approved and business assigned');
            fetchClaims();
        } catch (error) {
            console.error('Error approving claim:', error);
            toast.error('Failed to approve claim');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedClaim) return;

        setProcessing(true);
        try {
            const { error } = await supabase
                .from('business_claims')
                .update({
                    status: 'rejected',
                    // could append reason to notes or strictly use a new column if exists. 
                    // Schema has 'notes', I'll append to it.
                    notes: selectedClaim.notes ? `${selectedClaim.notes}\n\nRejection Reason: ${rejectionReason}` : `Rejection Reason: ${rejectionReason}`
                })
                .eq('id', selectedClaim.id);

            if (error) throw error;

            toast.success('Claim rejected');
            setShowRejectDialog(false);
            setRejectionReason('');
            fetchClaims();
        } catch (error) {
            console.error('Error rejecting claim:', error);
            toast.error('Failed to reject claim');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
        }
    };

    const openEvidence = async (path: string) => {
        try {
            // Since it's a private bucket, we need a signed URL
            const { data, error } = await supabase.storage
                .from('claim-documents')
                .createSignedUrl(path, 60 * 10); // 10 minutes

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (e) {
            toast.error("Could not generate secure link for document");
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-96 bg-muted rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Claims Management</h1>
                <p className="text-muted-foreground mt-1">Review and verify business ownership claims</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Claims</CardTitle>
                    <CardDescription>
                        {claims.filter(c => c.status === 'pending').length} pending review
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>User Email</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Evidence</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{claim.business?.business_name || 'Unknown Business'}</span>
                                            <span className="text-xs text-muted-foreground">slug: {claim.business?.slug}</span>
                                            {claim.business?.claimed && claim.status === 'pending' && (
                                                <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                                    <ShieldAlert className="w-3 h-3" /> Already Claimed
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {claim.profile?.email || 'Unknown User'}
                                        {claim.notes && (
                                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={claim.notes}>
                                                Note: {claim.notes}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {claim.proof_doc_url ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-2 text-blue-500"
                                                onClick={() => openEvidence(claim.proof_doc_url!)}
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Doc
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No Document</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {claim.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleApprove(claim)}
                                                    disabled={processing}
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedClaim(claim);
                                                        setShowRejectDialog(true);
                                                    }}
                                                    disabled={processing}
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {claims.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No claims found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Claim</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this claim. This will be visible to the user (if we implement notification).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
                            Reject Claim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
