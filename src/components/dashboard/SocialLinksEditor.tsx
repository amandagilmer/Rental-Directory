import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

interface SocialLinksEditorProps {
  listingId: string;
  initialData?: {
    facebook_url?: string | null;
    instagram_url?: string | null;
    twitter_url?: string | null;
    linkedin_url?: string | null;
    youtube_url?: string | null;
  };
  onSave?: () => void;
}

export default function SocialLinksEditor({ listingId, initialData, onSave }: SocialLinksEditorProps) {
  const [links, setLinks] = useState({
    facebook_url: initialData?.facebook_url || '',
    instagram_url: initialData?.instagram_url || '',
    twitter_url: initialData?.twitter_url || '',
    linkedin_url: initialData?.linkedin_url || '',
    youtube_url: initialData?.youtube_url || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLinks({
        facebook_url: initialData.facebook_url || '',
        instagram_url: initialData.instagram_url || '',
        twitter_url: initialData.twitter_url || '',
        linkedin_url: initialData.linkedin_url || '',
        youtube_url: initialData.youtube_url || ''
      });
    }
  }, [initialData]);

  const validateUrl = (url: string, platform: string): boolean => {
    if (!url) return true; // Empty is valid
    
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    // Validate all URLs
    const platforms = ['facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'youtube_url'];
    for (const platform of platforms) {
      const url = links[platform as keyof typeof links];
      if (url && !validateUrl(url, platform)) {
        toast.error(`Please enter a valid URL for ${platform.replace('_url', '').replace('_', ' ')}`);
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_listings')
        .update({
          facebook_url: links.facebook_url || null,
          instagram_url: links.instagram_url || null,
          twitter_url: links.twitter_url || null,
          linkedin_url: links.linkedin_url || null,
          youtube_url: links.youtube_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;
      toast.success('Social links saved');
      onSave?.();
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error('Failed to save social links');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Media Links
        </CardTitle>
        <CardDescription>
          Connect your social media profiles to increase visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={links.facebook_url}
            onChange={(e) => setLinks({ ...links, facebook_url: e.target.value })}
            placeholder="https://facebook.com/yourbusiness"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={links.instagram_url}
            onChange={(e) => setLinks({ ...links, instagram_url: e.target.value })}
            placeholder="https://instagram.com/yourbusiness"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input
            id="twitter"
            value={links.twitter_url}
            onChange={(e) => setLinks({ ...links, twitter_url: e.target.value })}
            placeholder="https://twitter.com/yourbusiness"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={links.linkedin_url}
            onChange={(e) => setLinks({ ...links, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/company/yourbusiness"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            value={links.youtube_url}
            onChange={(e) => setLinks({ ...links, youtube_url: e.target.value })}
            placeholder="https://youtube.com/@yourbusiness"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Social Links'}
        </Button>
      </CardContent>
    </Card>
  );
}
