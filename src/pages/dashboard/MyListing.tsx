import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const categories = [
  'Car Rental',
  'Equipment Rental',
  'Event Rental',
  'Storage',
  'Bikes & Scooters',
  'Party Supplies'
];

const listingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export default function MyListing() {
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    is_published: false
  });

  useEffect(() => {
    const fetchListing = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('business_listings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setListing(data);
        setFormData({
          business_name: data.business_name || '',
          description: data.description || '',
          category: data.category || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          is_published: data.is_published || false
        });
      }

      setLoading(false);
    };

    fetchListing();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      listingSchema.parse(formData);
      setSaving(true);

      if (listing) {
        // Update existing listing
        const { error } = await supabase
          .from('business_listings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', listing.id);

        if (error) throw error;
        toast.success('Listing updated successfully');
      } else {
        // Create new listing
        const { error } = await supabase
          .from('business_listings')
          .insert({
            ...formData,
            user_id: user?.id
          });

        if (error) throw error;
        toast.success('Listing created successfully');
        
        // Reload to get the created listing
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Business Listing</h1>
        <p className="text-muted-foreground mt-2">
          {listing ? 'Update your business information' : 'Create your business listing'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will be displayed publicly on the directory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your rental business..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published">Publish listing (make visible to public)</Label>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : listing ? 'Update Listing' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
