
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { GenerateImageDialog } from "@/components/dashboard/GenerateImageDialog";

interface CategoryImageUploadProps {
    slug: string;
    currentImageUrl: string | null;
    onImageUpdate: (url: string | null) => void;
    categoryName?: string;
}

export const CategoryImageUpload = ({ slug, currentImageUrl, onImageUpdate, categoryName = '' }: CategoryImageUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${slug}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("category-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from("category-images")
                .getPublicUrl(filePath);

            onImageUpdate(data.publicUrl);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = "";
        }
    };

    const clearImage = () => {
        onImageUpdate(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {currentImageUrl ? (
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden border">
                        <img
                            src={currentImageUrl}
                            alt="Category"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="w-32 h-24 rounded-lg border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground">
                        <span className="text-xs">No image</span>
                    </div>
                )}

                <div className="flex-1">
                    <Label htmlFor="category-image" className="cursor-pointer">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={uploading}
                                onClick={() => document.getElementById("category-image")?.click()}
                            >
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                {uploading ? "Uploading..." : currentImageUrl ? "Change Image" : "Upload Image"}
                            </Button>

                            <div onClick={(e) => e.preventDefault()}>
                                <GenerateImageDialog
                                    onImageGenerated={onImageUpdate}
                                    categoryName={categoryName}
                                />
                            </div>
                        </div>
                    </Label>
                    <input
                        id="category-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 800x600px or larger.
                    </p>
                </div>
            </div>
        </div>
    );
};
