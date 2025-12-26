import { useState, useEffect, useCallback } from 'react';
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
import { Package, Plus, Edit, Trash2, DollarSign, Image as ImageIcon, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServicePhotoUpload from './ServicePhotoUpload';
import UnitAnalytics from './UnitAnalytics';

const PRICE_UNITS = [
  { value: 'per hour', label: 'Per Hour' },
  { value: 'per day', label: 'Per Day' },
  { value: 'per week', label: 'Per Week' },
  { value: 'per event', label: 'Per Event' },
  { value: 'contact for pricing', label: 'Contact for Pricing' }
];

interface ServicePhoto {
  id: string;
  storage_path: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

interface Service {
  id?: string;
  service_name: string;
  description: string;
  price: number | null;
  price_unit: string;
  is_available: boolean;
  photos?: ServicePhoto[];
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
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    const { data: servicesData } = await supabase
      .from('business_services')
      .select('*')
      .eq('listing_id', listingId)
      .order('display_order');

    if (servicesData) {
      // Fetch photos for each service
      const servicesWithPhotos = await Promise.all(
        servicesData.map(async (service) => {
          const { data: photos } = await supabase
            .from('service_photos')
            .select('*')
            .eq('service_id', service.id)
            .order('display_order');
          
          return { ...service, photos: photos || [] } as Service;
        })
      );
      setServices(servicesWithPhotos);
    }
    setLoading(false);
  }, [listingId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
        toast.success('Unit updated');
      } else {
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
        toast.success('Unit added');
      }

      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save unit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      // First delete all photos from storage
      const { data: photos } = await supabase
        .from('service_photos')
        .select('storage_path')
        .eq('service_id', serviceId);

      if (photos && photos.length > 0) {
        const paths = photos.map(p => p.storage_path);
        await supabase.storage.from('business-photos').remove(paths);
      }

      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast.success('Unit deleted');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete unit');
    }
  };

  const formatPrice = (service: Service) => {
    if (service.price_unit === 'contact for pricing' || service.price === null) {
      return 'Contact for pricing';
    }
    return `$${service.price.toFixed(2)} ${service.price_unit}`;
  };

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('business-photos').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  if (loading) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">Loading units...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Units & Listings
            </CardTitle>
            <CardDescription>
              Add your rental units and equipment with pricing and photos
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Unit/Equipment Name *</Label>
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
                    placeholder="Describe the unit or equipment..."
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
                    {saving ? 'Saving...' : 'Save Unit'}
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
            No units added yet. Add your rental units and equipment to attract more customers.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Collapsible
                key={service.id}
                open={expandedService === service.id}
                onOpenChange={(open) => setExpandedService(open ? service.id! : null)}
              >
                <div className="bg-muted/50 rounded-lg overflow-hidden">
                  <div className="flex items-start justify-between p-4">
                    <div className="flex gap-3 flex-1">
                      {/* Thumbnail */}
                      {service.photos && service.photos.length > 0 ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={getPublicUrl(service.photos.find(p => p.is_primary)?.storage_path || service.photos[0].storage_path)}
                            alt={service.service_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{service.service_name}</h4>
                          {!service.is_available && (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                          {service.photos && service.photos.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {service.photos.length}
                            </Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{service.description}</p>
                        )}
                        <p className="text-sm font-medium text-primary mt-1">{formatPrice(service)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => service.id && handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedService === service.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-border pt-4">
                      <Tabs defaultValue="photos">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="photos" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Photos
                          </TabsTrigger>
                          <TabsTrigger value="analytics" className="text-xs">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analytics
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="photos">
                          <ServicePhotoUpload
                            serviceId={service.id!}
                            listingId={listingId}
                            photos={service.photos || []}
                            onPhotosChange={fetchServices}
                          />
                        </TabsContent>
                        <TabsContent value="analytics">
                          <UnitAnalytics 
                            serviceId={service.id!} 
                            serviceName={service.service_name}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}