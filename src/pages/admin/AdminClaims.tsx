import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, FileText, ExternalLink, ShieldAlert, Loader2 } from 'lucide-react';
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
    dl_doc_url: string | null;
    claimant_name: string | null;
    claimant_phone: string | null;
    claimant_address: string | null;
    created_at: string;
    business?: {
        business_name: string;
        slug: string;
        claimed: boolean;
        verification_doc_url?: string;
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
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const fetchClaims = async () => {
        try {
            const { data, error } = await supabase
                .from('business_claims')
                .select(`
          *,
          business:business_listings(business_name, slug, claimed, verification_doc_url),
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

    const handleApprove = (claim: Claim) => {
        setSelectedClaim(claim);
        setShowApproveDialog(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedClaim) return;

        setProcessing(true);
        try {
            // 1. Update claim status
            const { error: claimError } = await supabase
                .from('business_claims')
                .update({ status: 'approved' })
                .eq('id', selectedClaim.id);

            if (claimError) throw claimError;

            // 2. Update business listing owner AND store the verification document
            const { error: businessError } = await supabase
                .from('business_listings')
                .update({
                    user_id: selectedClaim.user_id,
                    claimed: true,
                    verification_doc_url: selectedClaim.proof_doc_url // Store the winning document as the source of truth
                })
                .eq('id', selectedClaim.business_id);

            if (businessError) throw businessError;

            // 3. Promote user to 'host' and sync profile info
            const profileUpdates: any = {
                user_type: 'host'
            };

            if (selectedClaim.claimant_name) profileUpdates.full_name = selectedClaim.claimant_name;
            if (selectedClaim.claimant_phone) profileUpdates.phone = selectedClaim.claimant_phone;
            if (selectedClaim.claimant_address) profileUpdates.personal_address = selectedClaim.claimant_address;

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', selectedClaim.user_id);

            if (profileError) {
                console.warn('Profile sync failed but business was assigned:', profileError);
                toast.error('Business assigned, but profile sync failed.');
            } else {
                toast.success('Claim approved, business assigned, and profile promoted');
            }

            setShowApproveDialog(false);
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
            setProcessing(true);
            const { data, error } = await supabase.storage
                .from('claim-documents')
                .createSignedUrl(path, 60 * 15); // 15 minutes

            if (error) throw error;
            if (data?.signedUrl) {
                const fileExt = path.split('.').pop()?.toLowerCase();
                if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt || '')) {
                    setPreviewType('image');
                } else if (fileExt === 'pdf') {
                    setPreviewType('pdf');
                } else {
                    setPreviewType('other');
                }

                setPreviewUrl(data.signedUrl);
                setShowPreview(true);
            }
        } catch (e) {
            console.error("Preview error:", e);
            toast.error("Could not generate secure link for document");
        } finally {
            setProcessing(false);
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
                                <TableHead>Claimant Info</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Evidence</TableHead>
                                <TableHead>Comparison</TableHead>
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
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base text-foreground">
                                                    {claim.claimant_name || 'Name Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 group">
                                                <span className="text-sm font-medium">{claim.claimant_phone || 'Phone Unknown'}</span>
                                                {claim.claimant_phone && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(claim.claimant_phone!);
                                                            toast.success("Phone copied");
                                                        }}
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{claim.profile?.email}</span>
                                            </div>
                                            {claim.claimant_address && (
                                                <div className="text-xs text-blue-400 mt-1 max-w-[200px] truncate" title={claim.claimant_address}>
                                                    {claim.claimant_address}
                                                </div>
                                            )}
                                            {claim.notes && (
                                                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded italic border-l-2 border-primary/30" title={claim.notes}>
                                                    "{claim.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            {claim.proof_doc_url ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-2 text-blue-500 justify-start"
                                                    onClick={() => openEvidence(claim.proof_doc_url!)}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Evidence
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No Evidence</span>
                                            )}

                                            {claim.dl_doc_url ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-2 text-amber-500 justify-start"
                                                    onClick={() => openEvidence(claim.dl_doc_url!)}
                                                >
                                                    <ShieldAlert className="h-4 w-4" />
                                                    Review ID
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">No ID Doc</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {claim.business?.verification_doc_url ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-2 text-muted-foreground"
                                                onClick={() => openEvidence(claim.business!.verification_doc_url!)}
                                            >
                                                <ShieldAlert className="h-4 w-4" />
                                                View Current
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Unverified</span>
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
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Reject Claim</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Please provide a reason for rejecting this claim. This will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection..."
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Reject Claim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Approve Claim</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to approve this claim? This will grant the user ownership of <strong>{selectedClaim?.business?.business_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-sm text-emerald-400">
                                This action will transfer tactical control of the business listing to the claimant and mark it as verified.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={handleApproveConfirm} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-black/95 border-zinc-800">
                    <DialogHeader className="p-4 border-b border-zinc-800 bg-background text-foreground shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Document Evidence Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                        {previewUrl ? (
                            <>
                                {previewType === 'image' && (
                                    <img
                                        src={previewUrl}
                                        alt="Evidence"
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                    />
                                )}
                                {previewType === 'pdf' && (
                                    <embed
                                        src={previewUrl}
                                        type="application/pdf"
                                        className="w-full h-full rounded-sm border-0"
                                    />
                                )}
                                {previewType === 'other' && (
                                    <div className="text-center space-y-4">
                                        <div className="bg-zinc-900 p-8 rounded-full inline-block">
                                            <FileText className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-medium text-white">Preview not available</h3>
                                        <p className="text-zinc-400">This file type cannot be previewed directly.</p>
                                        <Button asChild variant="secondary">
                                            <a href={previewUrl} target="_blank" rel="noreferrer">
                                                Download to View
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-zinc-500">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Loading preview...</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t border-zinc-800 bg-background shrink-0">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>
                            Close Preview
                        </Button>
                        {previewUrl && (
                            <Button asChild>
                                <a href={previewUrl} target="_blank" rel="noreferrer" className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Open in New Tab
                                </a>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
