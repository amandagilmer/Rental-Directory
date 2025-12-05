import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Star, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Photo {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

interface PhotoUploadProps {
  listingId: string;
  photos: Photo[];
  onPhotosChange: () => void;
}

export default function PhotoUpload({ listingId, photos, onPhotosChange }: PhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('business-photos').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 5MB allowed.`);
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${user.id}/${listingId}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('business-photos')
          .upload(storagePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(uploadError);
          continue;
        }

        // Insert record into business_photos table
        const isPrimary = photos.length === 0;
        const { error: dbError } = await supabase
          .from('business_photos')
          .insert({
            listing_id: listingId,
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            is_primary: isPrimary,
            display_order: photos.length
          });

        if (dbError) {
          toast.error(`Failed to save ${file.name} reference`);
          console.error(dbError);
          // Clean up uploaded file
          await supabase.storage.from('business-photos').remove([storagePath]);
          continue;
        }

        toast.success(`${file.name} uploaded successfully`);
      }

      onPhotosChange();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photo: Photo) => {
    setDeleting(photo.id);
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('business-photos')
        .remove([photo.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('business_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // If deleted photo was primary, set another as primary
      if (photo.is_primary && photos.length > 1) {
        const nextPhoto = photos.find(p => p.id !== photo.id);
        if (nextPhoto) {
          await supabase
            .from('business_photos')
            .update({ is_primary: true })
            .eq('id', nextPhoto.id);
        }
      }

      toast.success('Photo deleted');
      onPhotosChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetPrimary = async (photo: Photo) => {
    try {
      // Remove primary from all photos
      await supabase
        .from('business_photos')
        .update({ is_primary: false })
        .eq('listing_id', listingId);

      // Set this photo as primary
      await supabase
        .from('business_photos')
        .update({ is_primary: true })
        .eq('id', photo.id);

      toast.success('Primary photo updated');
      onPhotosChange();
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to update primary photo');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Business Photos
        </CardTitle>
        <CardDescription>
          Upload photos of your rental inventory, storefront, and equipment. First photo will be your cover image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Click to upload photos'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP, or GIF up to 5MB each
          </p>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={getPublicUrl(photo.storage_path)}
                  alt={photo.file_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Badge */}
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Cover
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.is_primary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(photo)}
                      className="text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Cover
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(photo)}
                    disabled={deleting === photo.id}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No photos uploaded yet. Add photos to make your listing stand out!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
