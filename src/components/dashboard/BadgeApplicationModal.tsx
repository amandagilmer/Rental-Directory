import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Upload, Loader2, ShieldCheck } from "lucide-react";

interface BadgeApplicationModalProps {
    listingId: string;
    badges: { badge_key: string; name: string }[];
}

export function BadgeApplicationModal({ listingId, badges }: BadgeApplicationModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<string>('');
    const [documentType, setDocumentType] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!selectedBadge || !documentType || !file) {
            toast.error("Please fill in all fields and upload proof");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `verifications/${listingId}/${selectedBadge}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('business-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Create Verification Request
            const { error: requestError } = await supabase
                .from('badge_verifications')
                .insert({
                    listing_id: listingId,
                    badge_key: selectedBadge,
                    document_type: documentType,
                    document_path: filePath,
                    status: 'pending'
                });

            if (requestError) throw requestError;

            toast.success("Application submitted successfully! Our team will review it shortly.");
            setOpen(false);
            // Reset form
            setSelectedBadge('');
            setDocumentType('');
            setFile(null);
        } catch (error) {
            console.error('Badge application error:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic tracking-tighter transition-all hover:scale-105">
                    <Award className="h-4 w-4 mr-2" />
                    Apply for Badge
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0F1C] border-white/10 text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-red-600/20 border border-red-600/30">
                            <ShieldCheck className="h-6 w-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-white font-display text-xl uppercase italic tracking-tight">Badge Application</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400">
                        Submit your credentials to earn a trust badge. Verified status increases your visibility to premium renters.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="badge" className="text-gray-300 uppercase tracking-widest text-[10px] font-bold">Select Badge</Label>
                        <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Choose a badge..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0F1C] border-white/10 text-white">
                                {badges.map((badge) => (
                                    <SelectItem key={badge.badge_key} value={badge.badge_key}>
                                        {badge.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="docType" className="text-gray-300 uppercase tracking-widest text-[10px] font-bold">Document Type</Label>
                        <Input
                            id="docType"
                            placeholder="e.g. Insurance Policy, Business License"
                            className="bg-white/5 border-white/10 text-white"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-gray-300 uppercase tracking-widest text-[10px] font-bold">Proof of Compliance</Label>
                        <div className="relative group">
                            <Input
                                type="file"
                                className="hidden"
                                id="proof-upload"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept="image/*,.pdf"
                            />
                            <label
                                htmlFor="proof-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group-hover:border-red-600/50"
                            >
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                                        <span className="text-xs text-gray-300 font-medium truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-gray-500 mb-2 group-hover:text-red-500 transition-colors" />
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Upload Proof</span>
                                    </>
                                )}
                            </label>
                        </div>
                        <p className="text-[10px] text-gray-500">Accepted: Images or PDF (Max 5MB)</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic tracking-wider px-8"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                        Submit for Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
