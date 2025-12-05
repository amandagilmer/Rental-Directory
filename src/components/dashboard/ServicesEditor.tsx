import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PRICE_UNITS = [
  { value: 'per hour', label: 'Per Hour' },
  { value: 'per day', label: 'Per Day' },
  { value: 'per week', label: 'Per Week' },
  { value: 'per event', label: 'Per Event' },
  { value: 'contact for pricing', label: 'Contact for Pricing' }
];

interface Service {
  id?: string;
  service_name: string;
  description: string;
  price: number | null;
  price_unit: string;
  is_available: boolean;
}

interface ServicesEditorProps {
  listingId: string;
}

const emptyService: Service = {
  service_name: '',
  description: '',
  price: null,
  price_unit: 'per day',
  is_available: true
};

export default function ServicesEditor({ listingId }: ServicesEditorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>(emptyService);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('business_services')
      .select('*')
      .eq('listing_id', listingId)
      .order('display_order');

    if (data) {
      setServices(data as Service[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [listingId]);

  const openAddDialog = () => {
    setEditingService(null);
    setFormData(emptyService);
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.service_name.trim()) {
      toast.error('Service name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingService?.id) {
        // Update existing
        const { error } = await supabase
          .from('business_services')
          .update({
            service_name: formData.service_name,
            description: formData.description,
            price: formData.price_unit === 'contact for pricing' ? null : formData.price,
            price_unit: formData.price_unit,
            is_available: formData.is_available,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Service updated');
      } else {
        // Insert new
        const { error } = await supabase
          .from('business_services')
          .insert({
            listing_id: listingId,
            service_name: formData.service_name,
            description: formData.description,
            price: formData.price_unit === 'contact for pricing' ? null : formData.price,
            price_unit: formData.price_unit,
            is_available: formData.is_available,
            display_order: services.length
          });

        if (error) throw error;
        toast.success('Service added');
      }

      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const formatPrice = (service: Service) => {
    if (service.price_unit === 'contact for pricing' || service.price === null) {
      return 'Contact for pricing';
    }
    return `$${service.price.toFixed(2)} ${service.price_unit}`;
  };

  if (loading) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">Loading services...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Services & Pricing
            </CardTitle>
            <CardDescription>
              Add your rental services and equipment with pricing
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Service/Equipment Name *</Label>
                  <Input
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    placeholder="e.g., 10x10 Party Tent"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the service or equipment..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="0.00"
                        className="pl-9"
                        disabled={formData.price_unit === 'contact for pricing'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Unit</Label>
                    <Select
                      value={formData.price_unit}
                      onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label>Currently Available</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Service'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No services added yet. Add your rental services and equipment to attract more customers.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{service.service_name}</h4>
                    {!service.is_available && (
                      <Badge variant="secondary">Unavailable</Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  )}
                  <p className="text-sm font-medium text-primary mt-2">{formatPrice(service)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => service.id && handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
