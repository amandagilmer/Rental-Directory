import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceLocation {
  id?: string;
  location_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  pickup_available: boolean;
  dropoff_available: boolean;
  notes: string | null;
}

interface ServiceLocationEditorProps {
  serviceId: string;
  serviceName: string;
}

const emptyLocation: ServiceLocation = {
  location_name: '',
  address: null,
  city: null,
  state: null,
  zip_code: null,
  latitude: null,
  longitude: null,
  is_primary: false,
  pickup_available: true,
  dropoff_available: true,
  notes: null,
};

export default function ServiceLocationEditor({ serviceId, serviceName }: ServiceLocationEditorProps) {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ServiceLocation | null>(null);
  const [formData, setFormData] = useState<ServiceLocation>(emptyLocation);
  const [saving, setSaving] = useState(false);

  const fetchLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from('service_locations')
      .select('*')
      .eq('service_id', serviceId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  }, [serviceId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const openAddDialog = () => {
    setEditingLocation(null);
    setFormData({ ...emptyLocation, is_primary: locations.length === 0 });
    setDialogOpen(true);
  };

  const openEditDialog = (location: ServiceLocation) => {
    setEditingLocation(location);
    setFormData(location);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.location_name.trim()) {
      toast.error('Location name is required');
      return;
    }

    setSaving(true);
    try {
      // If setting as primary, unset other primaries first
      if (formData.is_primary && !editingLocation?.is_primary) {
        await supabase
          .from('service_locations')
          .update({ is_primary: false })
          .eq('service_id', serviceId);
      }

      const locationData = {
        service_id: serviceId,
        location_name: formData.location_name,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        is_primary: formData.is_primary,
        pickup_available: formData.pickup_available,
        dropoff_available: formData.dropoff_available,
        notes: formData.notes || null,
      };

      if (editingLocation?.id) {
        const { error } = await supabase
          .from('service_locations')
          .update(locationData)
          .eq('id', editingLocation.id);

        if (error) throw error;
        toast.success('Location updated');
      } else {
        const { error } = await supabase
          .from('service_locations')
          .insert(locationData);

        if (error) throw error;
        toast.success('Location added');
      }

      setDialogOpen(false);
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (locationId: string) => {
    try {
      const { error } = await supabase
        .from('service_locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;
      toast.success('Location removed');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const setPrimary = async (locationId: string) => {
    try {
      // Unset all primaries first
      await supabase
        .from('service_locations')
        .update({ is_primary: false })
        .eq('service_id', serviceId);

      // Set the new primary
      const { error } = await supabase
        .from('service_locations')
        .update({ is_primary: true })
        .eq('id', locationId);

      if (error) throw error;
      toast.success('Primary location updated');
      fetchLocations();
    } catch (error) {
      console.error('Error setting primary:', error);
      toast.error('Failed to set primary location');
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading locations...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Pickup/Dropoff Locations</span>
          {locations.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {locations.length} location{locations.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add Pickup/Dropoff Location'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Location Name *</Label>
                <Input
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g. Main Yard, Downtown Office"
                />
              </div>

              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="TX"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input
                    value={formData.zip_code || ''}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pickup Available</Label>
                    <p className="text-xs text-muted-foreground">Customers can pick up here</p>
                  </div>
                  <Switch
                    checked={formData.pickup_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, pickup_available: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dropoff Available</Label>
                    <p className="text-xs text-muted-foreground">Customers can return here</p>
                  </div>
                  <Switch
                    checked={formData.dropoff_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, dropoff_available: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Primary Location</Label>
                    <p className="text-xs text-muted-foreground">Default pickup point</p>
                  </div>
                  <Switch
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions, gate codes, etc."
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : editingLocation ? 'Update' : 'Add Location'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location List */}
      {locations.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No locations added. Add pickup/dropoff locations for this unit.
        </p>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <MapPin className={`h-4 w-4 ${location.is_primary ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{location.location_name}</span>
                    {location.is_primary && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  {(location.address || location.city) && (
                    <p className="text-xs text-muted-foreground">
                      {[location.address, location.city, location.state, location.zip_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1">
                    {location.pickup_available && (
                      <Badge variant="outline" className="text-xs">Pickup</Badge>
                    )}
                    {location.dropoff_available && (
                      <Badge variant="outline" className="text-xs">Dropoff</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!location.is_primary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrimary(location.id!)}
                    title="Set as primary"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(location)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(location.id!)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
