import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle2, Shield, Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BusinessListing {
  id: string;
  business_name: string;
  // properties needed for display
  slug: string;
}

export default function ClaimBusiness() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantAddress, setClaimantAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);

  useEffect(() => {
    // specific check for access without slug
    if (!slug) {
      setError('Invalid claim link');
      setLoading(false);
      return;
    }

    const checkAuthAndFetchBusiness = async () => {
      // 1. Check Auth
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);

      if (session?.user?.id) {
        // Fetch profile to pre-populate name/phone/address
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, personal_address')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setClaimantName(profile.full_name || '');
          setClaimantPhone(profile.phone || '');
          setClaimantAddress(profile.personal_address || '');
        }
      }

      // 2. Fetch Business
      const { data: listing, error: listingError } = await supabase
        .from('business_listings')
        .select('id, business_name, slug, claimed')
        .eq('slug', slug)
        .maybeSingle();

      if (listingError || !listing) {
        console.error('Error fetching business:', listingError);
        setError('Business not found or invalid link.');
        setLoading(false);
        return;
      }

      if (listing.claimed) {
        setError('This business has already been claimed.');
        setLoading(false);
        return;
      }

      // Check if there's already a pending claim for this business
      const { data: existingClaim } = await supabase
        .from('business_claims')
        .select('id, status, user_id')
        .eq('business_id', listing.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingClaim) {
        if (session?.user?.id && existingClaim.user_id === session.user.id) {
          setError(`You already have a pending claim for this business.`);
        } else {
          setError(`A claim for this business is already being processed.`);
        }
        setLoading(false);
        return;
      }

      setBusiness(listing as BusinessListing);
      setLoading(false);
    };

    checkAuthAndFetchBusiness();
  }, [slug]);

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleDlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDlFile(e.target.files[0]);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to auth page with return URL and mode=register
    navigate(`/auth?returnUrl=${encodeURIComponent(location.pathname)}&mode=register`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !business) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a claim.",
        variant: "destructive"
      });
      return;
    }

    if (!proofFile && notes.length < 10) {
      toast({
        title: "Information Required",
        description: "Please provide either a proof document or detailed notes explaining your ownership.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      let proofUrl = null;
      let dlUrl = null;

      // 1. Upload Proof File if exists
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${userId}/${business.id}-proof-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;
        proofUrl = fileName;
      }

      // 1b. Upload DL File if exists
      if (dlFile) {
        const fileExt = dlFile.name.split('.').pop();
        const fileName = `${userId}/${business.id}-dl-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(fileName, dlFile);

        if (uploadError) throw uploadError;
        dlUrl = fileName;
      }

      // 2. Update Profile if info was provided
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            full_name: claimantName,
            phone: claimantPhone,
            personal_address: claimantAddress
          })
          .eq('id', userId);
      }

      // 3. Create Claim Record
      const { error: insertError } = await supabase
        .from('business_claims')
        .insert({
          business_id: business.id,
          user_id: userId,
          status: 'pending',
          notes: notes,
          proof_doc_url: proofUrl,
          dl_doc_url: dlUrl,
          claimant_name: claimantName,
          claimant_phone: claimantPhone,
          claimant_address: claimantAddress
        });

      if (insertError) throw insertError;

      toast({
        title: "Claim Submitted Successfully",
        description: "Our team will review your request and get back to you shortly.",
      });

      // Redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: unknown) {
      console.error('Claim submission error:', err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while submitting your claim.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Error State / Already Claimed / Business Not Found
  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-20 flex justify-center">
          <Card className="max-w-md w-full h-fit">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <CardTitle>Unable to Process Claim</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>
                Return to Directory
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Claim Business Listing
            </h1>
            <p className="text-muted-foreground">
              Verify your ownership of <strong>{business.business_name}</strong> to manage this profile.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
              <CardDescription>
                To prevent unauthorized access, we require proof of business ownership.
                This can be a business license, utility bill, or official registration document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userId ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">
                    You must be signed in to your Patriot Hauls user account to claim a business.
                  </p>
                  <Button onClick={handleLoginRedirect} size="lg">
                    Sign In or Create Account
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Claimant Information</AlertTitle>
                    <AlertDescription>
                      Please provide your contact details so our command team can reach you for verification.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={claimantPhone}
                        onChange={(e) => setClaimantPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Personal Residence Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Patriot Way, Austin, TX 78701"
                      value={claimantAddress}
                      onChange={(e) => setClaimantAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proof">Verification Document</Label>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative min-h-[140px] flex items-center justify-center">
                        <Input
                          id="proof"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleProofFileChange}
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          {proofFile ? (
                            <>
                              <FileText className="h-8 w-8 text-primary" />
                              <span className="font-medium text-xs text-foreground truncate max-w-[150px]">{proofFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Proof of Ownership</span>
                              <span className="text-[10px] text-muted-foreground">License, Utility Bill, etc.</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dl">Driver's License / ID</Label>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative min-h-[140px] flex items-center justify-center">
                        <Input
                          id="dl"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleDlFileChange}
                          required
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          {dlFile ? (
                            <>
                              <Shield className="h-8 w-8 text-primary" />
                              <span className="font-medium text-xs text-foreground truncate max-w-[150px]">{dlFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Upload ID</span>
                              <span className="text-[10px] text-muted-foreground">Required for Identity Verification</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Information / Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Please provide any other details that can help us verify your ownership (e.g., your role at the company, best time to call)."
                      className="min-h-[120px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Claim...
                      </>
                    ) : (
                      'Submit Claim for Review'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}