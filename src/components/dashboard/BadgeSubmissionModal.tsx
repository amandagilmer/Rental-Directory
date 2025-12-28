import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

interface BadgeSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  badgeKey: string;
  badgeName: string;
  badgeDescription: string;
  documentType: string;
}

interface ExistingSubmission {
  id: string;
  status: string;
  submitted_at: string;
  document_path: string;
  rejection_reason: string | null;
}

export default function BadgeSubmissionModal({
  open,
  onOpenChange,
  listingId,
  badgeKey,
  badgeName,
  badgeDescription,
  documentType,
}: BadgeSubmissionModalProps) {
  const [uploading, setUploading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<ExistingSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingSubmission = async () => {
      if (!open || !listingId || !badgeKey) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('badge_verifications')
        .select('*')
        .eq('listing_id', listingId)
        .eq('badge_key', badgeKey)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setExistingSubmission(data as ExistingSubmission);
      } else {
        setExistingSubmission(null);
      }
      setLoading(false);
    };

    fetchExistingSubmission();
  }, [open, listingId, badgeKey]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${badgeKey}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create verification record
      const { error: insertError } = await supabase
        .from('badge_verifications')
        .insert({
          listing_id: listingId,
          badge_key: badgeKey,
          document_type: documentType,
          document_path: fileName,
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast.success('Document submitted for verification');
      
      // Refresh the existing submission
      const { data } = await supabase
        .from('badge_verifications')
        .select('*')
        .eq('listing_id', listingId)
        .eq('badge_key', badgeKey)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setExistingSubmission(data as ExistingSubmission);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold uppercase tracking-wide">
            {badgeName}
          </DialogTitle>
          <DialogDescription>{badgeDescription}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : existingSubmission ? (
          <div className="space-y-4">
            {getStatusDisplay(existingSubmission.status)}
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Document Submitted</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(existingSubmission.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {existingSubmission.status === 'rejected' && existingSubmission.rejection_reason && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                  Rejection Reason:
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {existingSubmission.rejection_reason}
                </p>
              </div>
            )}

            {existingSubmission.status === 'rejected' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resubmit Document
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, WebP, PDF (max 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Required: {documentType}</h4>
              <p className="text-sm text-muted-foreground">
                Upload a clear image or PDF of your {documentType.toLowerCase()} to verify your eligibility for this badge.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upload Document
              </Label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, WebP, PDF (max 10MB)
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
