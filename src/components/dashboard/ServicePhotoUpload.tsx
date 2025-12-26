import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ServicePhoto {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

interface ServicePhotoUploadProps {
  serviceId: string;
  listingId: string;
  photos: ServicePhoto[];
  onPhotosChange: () => void;
}

export default function ServicePhotoUpload({ serviceId, listingId, photos, onPhotosChange }: ServicePhotoUploadProps) {
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
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 5MB allowed.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${user.id}/${listingId}/services/${serviceId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-photos')
          .upload(storagePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(uploadError);
          continue;
        }

        const isPrimary = photos.length === 0;
        const { error: dbError } = await supabase
          .from('service_photos')
          .insert({
            service_id: serviceId,
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            is_primary: isPrimary,
            display_order: photos.length
          });

        if (dbError) {
          toast.error(`Failed to save ${file.name} reference`);
          console.error(dbError);
          await supabase.storage.from('business-photos').remove([storagePath]);
          continue;
        }

        toast.success(`Photo uploaded`);
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

  const handleDelete = async (photo: ServicePhoto) => {
    setDeleting(photo.id);
    
    try {
      await supabase.storage
        .from('business-photos')
        .remove([photo.storage_path]);

      const { error: dbError } = await supabase
        .from('service_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      if (photo.is_primary && photos.length > 1) {
        const nextPhoto = photos.find(p => p.id !== photo.id);
        if (nextPhoto) {
          await supabase
            .from('service_photos')
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

  const handleSetPrimary = async (photo: ServicePhoto) => {
    try {
      await supabase
        .from('service_photos')
        .update({ is_primary: false })
        .eq('service_id', serviceId);

      await supabase
        .from('service_photos')
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Unit Photos</span>
      </div>
      
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-md overflow-hidden bg-muted"
            >
              <img
                src={getPublicUrl(photo.storage_path)}
                alt={photo.file_name}
                className="w-full h-full object-cover"
              />
              
              {photo.is_primary && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
                  <Star className="h-2 w-2" />
                  Main
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {!photo.is_primary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(photo)}
                    className="h-6 text-[10px] px-2"
                  >
                    <Star className="h-2 w-2" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(photo)}
                  disabled={deleting === photo.id}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-border rounded-md p-3 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">
          {uploading ? 'Uploading...' : 'Add photos'}
        </p>
      </div>
    </div>
  );
}