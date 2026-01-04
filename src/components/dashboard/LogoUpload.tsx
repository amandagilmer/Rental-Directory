import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LogoUploadProps {
    listingId: string;
    currentLogoUrl: string | null;
    onLogoChange: (url: string | null) => void;
}

export default function LogoUpload({ listingId, currentLogoUrl, onLogoChange }: LogoUploadProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !user) return;

        const file = files[0];
        setUploading(true);

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('File must be an image');
                return;
            }

            // Validate file size (2MB for logos)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo must be less than 2MB');
                return;
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const storagePath = `${user.id}/${listingId}/logo/${fileName}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('business-photos')
                .upload(storagePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('business-photos')
                .getPublicUrl(storagePath);

            // Update business_listings
            const { error: dbError } = await supabase
                .from('business_listings')
                .update({ logo_url: publicUrl })
                .eq('id', listingId);

            if (dbError) {
                throw dbError;
            }

            toast.success('Logo updated successfully');
            onLogoChange(publicUrl);

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to update logo');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveLogo = async () => {
        if (!confirm('Are you sure you want to remove the logo?')) return;

        setUploading(true);
        try {
            const { error } = await supabase
                .from('business_listings')
                .update({ logo_url: null })
                .eq('id', listingId);

            if (error) throw error;

            toast.success('Logo removed');
            onLogoChange(null);
        } catch (error: any) {
            console.error('Error removing logo:', error);
            toast.error('Failed to remove logo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Company Logo</h3>
            </div>

            <div className="flex items-start gap-6">
                {/* Preview Area */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                        {currentLogoUrl ? (
                            <>
                                <img
                                    src={currentLogoUrl}
                                    alt="Business Logo"
                                    className="w-full h-full object-contain p-2"
                                />
                                <button
                                    onClick={handleRemoveLogo}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </>
                        ) : (
                            <span className="text-muted-foreground text-xs text-center p-2">
                                No Logo
                            </span>
                        )}
                    </div>
                </div>

                {/* Upload Controls */}
                <div className="space-y-2 flex-1">
                    <p className="text-sm text-muted-foreground">
                        Upload your official business logo. This will be displayed on your profile avatar and in search results alongside your cover photo.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Recommended: Square PNG or JPG, min 400x400px. Max 2MB.
                    </p>

                    <div className="pt-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
