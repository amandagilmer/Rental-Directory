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
import { Package, Plus, Edit, Trash2, DollarSign, Image as ImageIcon, ChevronDown, ChevronUp, BarChart3, X, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServicePhotoUpload from './ServicePhotoUpload';
import UnitAnalytics from './UnitAnalytics';
import ServiceLocationEditor from './ServiceLocationEditor';

const ASSET_CLASSES = [
  { value: 'trailer', label: 'Trailer' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'rv', label: 'RV/Camper' },
  { value: 'storage', label: 'Storage' },
];

const SUB_CATEGORIES = {
  trailer: [
    { value: 'utility', label: 'Utility Trailer' },
    { value: 'enclosed', label: 'Enclosed Trailer' },
    { value: 'dump', label: 'Dump Trailer' },
    { value: 'flatbed', label: 'Flatbed Trailer' },
    { value: 'car-hauler', label: 'Car Hauler' },
    { value: 'livestock', label: 'Livestock Trailer' },
  ],
  equipment: [
    { value: 'construction', label: 'Construction Equipment' },
    { value: 'landscaping', label: 'Landscaping Equipment' },
    { value: 'power-tools', label: 'Power Tools' },
    { value: 'generators', label: 'Generators' },
  ],
  rv: [
    { value: 'travel-trailer', label: 'Travel Trailer' },
    { value: 'fifth-wheel', label: 'Fifth Wheel' },
    { value: 'motorhome', label: 'Motorhome' },
    { value: 'camper', label: 'Camper' },
  ],
  storage: [
    { value: 'container', label: 'Storage Container' },
    { value: 'pod', label: 'Storage Pod' },
    { value: 'unit', label: 'Storage Unit' },
  ],
};

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
  // Extended fields
  asset_class?: string;
  sub_category?: string;
  year_make_model?: string;
  length_ft?: string;
  payload_capacity?: string;
  empty_weight?: string;
  dimensions?: string;
  hitch_connection?: string;
  ball_size?: string;
  electrical_plug?: string;
  traction_type?: string;
  axle_configuration?: string;
  daily_rate?: number;
  three_day_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  features?: string[];
  youtube_url?: string;
}

interface ServicesEditorProps {
  listingId: string;
}

const emptyService: Service = {
  service_name: '',
  description: '',
  price: null,
  price_unit: 'per day',
  is_available: true,
  asset_class: 'trailer',
  sub_category: '',
  year_make_model: '',
  length_ft: '',
  payload_capacity: '',
  empty_weight: '',
  dimensions: '',
  hitch_connection: '',
  ball_size: '',
  electrical_plug: '',
  traction_type: '',
  axle_configuration: '',
  daily_rate: 0,
  three_day_rate: 0,
  weekly_rate: 0,
  monthly_rate: 0,
  features: [],
  youtube_url: '',
};

export default function ServicesEditor({ listingId }: ServicesEditorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>(emptyService);
  const [saving, setSaving] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const fetchServices = useCallback(async () => {
    const { data: servicesData } = await supabase
      .from('business_services')
      .select('*')
      .eq('listing_id', listingId)
      .order('display_order');

    if (servicesData) {
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
    setFormData({
      ...emptyService,
      ...service,
      features: service.features || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.service_name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    setSaving(true);
    try {
      // Use daily_rate as the main price
      const mainPrice = formData.daily_rate || formData.price;

      const serviceData = {
        service_name: formData.service_name,
        description: formData.description,
        price: mainPrice,
        price_unit: 'per day',
        is_available: formData.is_available,
        asset_class: formData.asset_class || null,
        sub_category: formData.sub_category || null,
        year_make_model: formData.year_make_model || null,
        length_ft: formData.length_ft || null,
        payload_capacity: formData.payload_capacity || null,
        empty_weight: formData.empty_weight || null,
        dimensions: formData.dimensions || null,
        hitch_connection: formData.hitch_connection || null,
        ball_size: formData.ball_size || null,
        electrical_plug: formData.electrical_plug || null,
        traction_type: formData.traction_type || null,
        axle_configuration: formData.axle_configuration || null,
        daily_rate: formData.daily_rate || null,
        three_day_rate: formData.three_day_rate || null,
        weekly_rate: formData.weekly_rate || null,
        monthly_rate: formData.monthly_rate || null,
        features: formData.features && formData.features.length > 0 ? formData.features : null,
        youtube_url: formData.youtube_url || null,
      };

      if (editingService?.id) {
        const { error } = await supabase
          .from('business_services')
          .update({
            ...serviceData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Asset updated');
      } else {
        const { error } = await supabase
          .from('business_services')
          .insert({
            listing_id: listingId,
            ...serviceData,
            display_order: services.length
          });

        if (error) throw error;
        toast.success('Asset deployed');
      }

      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
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
      toast.success('Asset decommissioned');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete asset');
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && formData.features) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    if (formData.features) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    }
  };

  const formatPrice = (service: Service) => {
    if (service.price === null) {
      return 'Contact for pricing';
    }
    return `$${service.price.toFixed(0)}/day`;
  };

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('business-photos').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const currentSubCategories = formData.asset_class 
    ? SUB_CATEGORIES[formData.asset_class as keyof typeof SUB_CATEGORIES] || []
    : [];

  if (loading) {
    return (
      <Card className="bg-[hsl(var(--navy-dark))] border-border">
        <CardContent className="pt-6">
          <p className="text-white/70">Loading fleet assets...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(var(--navy-dark))] border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground font-bold tracking-wide uppercase italic">
              <Package className="h-5 w-5 text-primary" />
              Fleet Assets
            </CardTitle>
            <CardDescription className="text-white/70 uppercase tracking-widest text-xs">
              Manage your rental units and equipment inventory
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openAddDialog} 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide"
              >
                <Plus className="h-4 w-4" />
                Deploy Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-[#1a1f2e] border-t-4 border-t-primary">
              <DialogHeader className="border-b border-border pb-4">
                <DialogTitle className="text-2xl font-bold uppercase italic text-white tracking-wide">
                  {editingService ? 'Refit Combat Asset' : 'Deploy New Strategic Asset'}
                </DialogTitle>
                <p className="text-xs uppercase tracking-widest text-white/70">
                  Fleet Operational Logistics Hub
                </p>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* MISSION BRIEFING */}
                <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                    Mission Briefing
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Asset Tactical Name
                      </Label>
                      <Input
                        value={formData.service_name}
                        onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                        placeholder="e.g. 2024 Heavy Duty Dump Trailer"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Class
                      </Label>
                      <Select
                        value={formData.asset_class}
                        onValueChange={(value) => setFormData({ ...formData, asset_class: value, sub_category: '' })}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_CLASSES.map(cls => (
                            <SelectItem key={cls.value} value={cls.value}>
                              {cls.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Deployment Sub-Class
                      </Label>
                      <Select
                        value={formData.sub_category}
                        onValueChange={(value) => setFormData({ ...formData, sub_category: value })}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentSubCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-white/80">
                      Operational Performance Brief (Description)
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide an exhaustive tactical briefing on this equipment's capabilities, maintenance status, and specific use cases..."
                      rows={4}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* COMBAT SPECIFICATIONS */}
                <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                    Combat Specifications
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Year/Make/Model
                      </Label>
                      <Input
                        value={formData.year_make_model || ''}
                        onChange={(e) => setFormData({ ...formData, year_make_model: e.target.value })}
                        placeholder="2024 Big Tex 70PI"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Length (FT)
                      </Label>
                      <Input
                        value={formData.length_ft || ''}
                        onChange={(e) => setFormData({ ...formData, length_ft: e.target.value })}
                        placeholder="20 ft"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Payload Capacity (LBS)
                      </Label>
                      <Input
                        value={formData.payload_capacity || ''}
                        onChange={(e) => setFormData({ ...formData, payload_capacity: e.target.value })}
                        placeholder="7,000 lbs"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Empty Weight (LBS)
                      </Label>
                      <Input
                        value={formData.empty_weight || ''}
                        onChange={(e) => setFormData({ ...formData, empty_weight: e.target.value })}
                        placeholder="2,200 lbs"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Dimensions
                      </Label>
                      <Input
                        value={formData.dimensions || ''}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="20'L x 6'11&quot;W"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Hitch Connection
                      </Label>
                      <Input
                        value={formData.hitch_connection || ''}
                        onChange={(e) => setFormData({ ...formData, hitch_connection: e.target.value })}
                        placeholder="Bumper"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Ball Size (IN)
                      </Label>
                      <Input
                        value={formData.ball_size || ''}
                        onChange={(e) => setFormData({ ...formData, ball_size: e.target.value })}
                        placeholder='2-5/16"'
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Electrical Plug
                      </Label>
                      <Input
                        value={formData.electrical_plug || ''}
                        onChange={(e) => setFormData({ ...formData, electrical_plug: e.target.value })}
                        placeholder="Round 7 Pin"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Traction Type
                      </Label>
                      <Input
                        value={formData.traction_type || ''}
                        onChange={(e) => setFormData({ ...formData, traction_type: e.target.value })}
                        placeholder="Bumper Pull"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Axle Configuration
                      </Label>
                      <Input
                        value={formData.axle_configuration || ''}
                        onChange={(e) => setFormData({ ...formData, axle_configuration: e.target.value })}
                        placeholder="Tandem Axle"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* MISSION RATES */}
                <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                    Mission Rates
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Daily Signal ($)
                      </Label>
                      <Input
                        type="number"
                        value={formData.daily_rate || ''}
                        onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value ? parseFloat(e.target.value) : 0 })}
                        placeholder="0"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        3-Day Block ($)
                      </Label>
                      <Input
                        type="number"
                        value={formData.three_day_rate || ''}
                        onChange={(e) => setFormData({ ...formData, three_day_rate: e.target.value ? parseFloat(e.target.value) : 0 })}
                        placeholder="0"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Weekly Deployment ($)
                      </Label>
                      <Input
                        type="number"
                        value={formData.weekly_rate || ''}
                        onChange={(e) => setFormData({ ...formData, weekly_rate: e.target.value ? parseFloat(e.target.value) : 0 })}
                        placeholder="0"
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/80">
                        Monthly Garrison ($)
                      </Label>
                      <Input
                        type="number"
                        value={formData.monthly_rate || ''}
                        onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value ? parseFloat(e.target.value) : 0 })}
                        placeholder="0"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* TACTICAL FEATURES & GALLERY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TACTICAL FEATURES */}
                  <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold uppercase italic text-primary tracking-wide">
                        Tactical Features
                      </h3>
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add feature..."
                          className="w-32 h-8 text-sm bg-background border-border"
                          onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                        />
                        <Button 
                          size="sm" 
                          onClick={addFeature}
                          className="bg-[hsl(var(--navy-dark))] hover:bg-[hsl(var(--navy-dark))]/80 text-foreground border border-border"
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.features && formData.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-background rounded p-3 border border-border"
                        >
                          <span className="text-foreground">{feature}</span>
                          <button 
                            onClick={() => removeFeature(index)}
                            className="text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {(!formData.features || formData.features.length === 0) && (
                        <p className="text-sm text-white/60 text-center py-4">
                          No features added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ASSET VISUAL GALLERY */}
                  <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold uppercase italic text-primary tracking-wide">
                        Asset Visual Gallery
                      </h3>
                      <Button 
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        + Add Photo
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-white/80">
                          Primary Asset Photo (Upload)
                        </Label>
                        <div className="flex items-center gap-4 p-4 bg-background rounded border border-dashed border-border">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white/50" />
                          </div>
                          <span className="text-sm text-white/60">
                            Upload Tactical Profile Image
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-white/80">
                          Action Briefing (YouTube URL)
                        </Label>
                        <Input
                          value={formData.youtube_url || ''}
                          onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                          placeholder="Action Video URL"
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="flex items-center gap-3 px-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label className="text-foreground uppercase tracking-wide">
                    Asset Operational & Available for Deployment
                  </Label>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-between gap-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="px-8 uppercase tracking-wide font-bold text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Abort Mission
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-12 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-wide font-bold"
                  >
                    {saving ? 'Deploying...' : 'Confirm Asset Deployment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-8 uppercase tracking-wide">
            No assets deployed. Deploy your rental fleet to attract more customers.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Collapsible
                key={service.id}
                open={expandedService === service.id}
                onOpenChange={(open) => setExpandedService(open ? service.id! : null)}
              >
                <div className="bg-background/50 rounded-lg overflow-hidden border border-border">
                  <div className="flex items-start justify-between p-4">
                    <div className="flex gap-3 flex-1">
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
                          <h4 className="font-bold text-foreground uppercase tracking-wide">
                            {service.service_name}
                          </h4>
                          {!service.is_available && (
                            <Badge variant="secondary" className="uppercase text-xs">
                              Offline
                            </Badge>
                          )}
                          {service.photos && service.photos.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {service.photos.length}
                            </Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(service)}
                        </p>
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
                        <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50">
                          <TabsTrigger value="photos" className="text-xs uppercase tracking-wide">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Visual Intel
                          </TabsTrigger>
                          <TabsTrigger value="locations" className="text-xs uppercase tracking-wide">
                            <MapPin className="h-3 w-3 mr-1" />
                            Locations
                          </TabsTrigger>
                          <TabsTrigger value="analytics" className="text-xs uppercase tracking-wide">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Performance
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
                        <TabsContent value="locations">
                          <ServiceLocationEditor
                            serviceId={service.id!}
                            serviceName={service.service_name}
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
