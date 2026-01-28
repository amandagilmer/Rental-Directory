import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Package, Plus, Edit, Trash2, DollarSign, Image as ImageIcon, ChevronDown, ChevronUp, BarChart3, X, MapPin, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServicePhotoUpload from './ServicePhotoUpload';
import UnitAnalytics from './UnitAnalytics';
import ServiceLocationEditor from './ServiceLocationEditor';
import { AIDescriptionEnhancer } from '@/components/AIDescriptionEnhancer';

const ASSET_CLASSES = [
  { value: 'trailer', label: 'Trailer' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'dumpster', label: 'Dumpster' },
  { value: 'rv', label: 'RV/Camper' },
  { value: 'storage', label: 'Storage' },
];

const SUB_CATEGORIES = {
  trailer: [
    { value: 'utility', label: 'Utility Trailer' },
    { value: 'dump', label: 'Dump Trailer' },
    { value: 'enclosed', label: 'Enclosed/Cargo Trailer' },
    { value: 'flatbed', label: 'Flatbed Trailer' },
    { value: 'car-hauler-open', label: 'Car Hauler (Open)' },
    { value: 'car-hauler-enclosed', label: 'Car Hauler (Enclosed)' },
    { value: 'gooseneck', label: 'Gooseneck Trailer' },
    { value: 'equipment-tilt', label: 'Equipment/Tilt Deck Trailer' },
    { value: 'livestock', label: 'Livestock Trailer' },
    { value: 'horse', label: 'Horse Trailer' },
    { value: 'landscaping', label: 'Landscaping Trailer' },
    { value: 'refrigerated', label: 'Refrigerated/Freezer Trailer' },
    { value: 'restroom', label: 'Restroom/Bathroom Trailer' },
    { value: 'pressure-washing', label: 'Pressure Washing Trailer' },
    { value: 'food-concession', label: 'Food/Concession Trailer' },
    { value: 'office-mobile', label: 'Office/Mobile Unit Trailer' },
    { value: 'specialty', label: 'Other Specialty Trailer' },
  ],
  equipment: [
    { value: 'skid-steer', label: 'Earthmoving - Skid Steer' },
    { value: 'mini-excavator', label: 'Earthmoving - Mini Excavator' },
    { value: 'compact-track-loader', label: 'Earthmoving - Compact Track Loader' },
    { value: 'backhoe', label: 'Earthmoving - Backhoe' },
    { value: 'wheel-loader', label: 'Earthmoving - Wheel Loader' },
    { value: 'tractor-compact', label: 'Tractor - Compact (Under 50 HP)' },
    { value: 'tractor-utility', label: 'Tractor - Utility (50-100 HP)' },
    { value: 'tractor-ag', label: 'Tractor - Agricultural (100+ HP)' },
    { value: 'attachment-bucket', label: 'Attachment - Bucket' },
    { value: 'attachment-forks', label: 'Attachment - Pallet Forks' },
    { value: 'attachment-grapple', label: 'Attachment - Grapple' },
    { value: 'attachment-auger', label: 'Attachment - Auger' },
    { value: 'attachment-trencher', label: 'Attachment - Trencher' },
    { value: 'attachment-cutter', label: 'Attachment - Brush Cutter' },
    { value: 'attachment-other', label: 'Attachment - Other' },
    { value: 'generator-portable', label: 'Generator - Portable (Under 10kW)' },
    { value: 'generator-towable', label: 'Generator - Towable (10kW+)' },
    { value: 'compaction-plate', label: 'Compaction - Plate Compactor' },
    { value: 'compaction-roller', label: 'Compaction - Roller' },
    { value: 'compaction-jack', label: 'Compaction - Jumping Jack' },
    { value: 'aerial-scissor', label: 'Aerial - Scissor Lift' },
    { value: 'aerial-boom', label: 'Aerial - Boom Lift' },
    { value: 'aerial-personnel', label: 'Aerial - Personnel Lift' },
    { value: 'concrete-mixer', label: 'Concrete - Mixer' },
    { value: 'concrete-saw', label: 'Concrete - Saw' },
    { value: 'concrete-grinder', label: 'Concrete - Grinder' },
    { value: 'pressure-washer', label: 'Pressure Washer - Commercial' },
    { value: 'light-tower', label: 'Light Tower' },
    { value: 'air-compressor', label: 'Air Compressor' },
    { value: 'welder', label: 'Welder' },
    { value: 'other-equipment', label: 'Other Equipment' },
  ],
  dumpster: [
    { value: 'roll-off', label: 'Roll-Off Dumpster' },
    { value: 'front-load', label: 'Front-Load Dumpster' },
    { value: 'rear-load', label: 'Rear-Load Dumpster' },
    { value: 'compactor', label: 'Compactor' },
  ],
};

const COMMON_TRAILER_FEATURES = [
  'STRAPS', 'CHAINS', 'BINDERS', 'SPARE TIRE', 'TIRE CHANGING KIT', 'TOOLBOX', 'GLOVES', 'RAMPS', 'TARP SYSTEM', 'LED LIGHTS', 'D-RINGS', 'E-TRACK', 'WINCH', 'STAKE POCKETS', 'TIE-DOWN HOOKS'
];

const COMMON_EQUIPMENT_FEATURES = [
  'ENCLOSED CAB', 'HEAT/AC', 'BACKUP CAMERA', 'QUICK ATTACH', 'HIGH FLOW HYDRAULICS', '2-SPEED', 'SUSPENSION SEAT', 'LIGHTS', 'HOUR METER VERIFIED', 'RECENT SERVICE', 'MANUAL INCLUDED', 'TRAINING AVAILABLE'
];

const COMMON_DUMPSTER_FEATURES = [
  'TARP INCLUDED', 'WHEELS/CASTERS', 'LOCKABLE LID', 'WALK-IN DOOR', 'LOW-PROFILE (Driveway friendly)', 'RESIDENTIAL FRIENDLY', 'COMMERCIAL USE', 'HOA APPROVED PLACEMENT'
];

const COMMON_DUMPSTER_MATERIALS = [
  'GENERAL HOUSEHOLD WASTE', 'CONSTRUCTION DEBRIS', 'YARD WASTE', 'FURNITURE', 'APPLIANCES (No Freon)', 'ROOFING MATERIALS', 'CONCRETE/BRICK (Weight limits apply)', 'DIRT/SOIL', 'MIXED RECYCLABLES'
];

const TRAILER_LENGTHS = ['4', '5', '6', '7', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '35', '40', '45', '50', '53'];
const TRAILER_WIDTHS = ['4', '5', '6', '6.5', '7', '8', '8.5', '102" (8.5)'];

const WEIGHT_VALUES = [
  500, 750, 1000, 1250, 1500, 1750, 2000, 2200, 2400, 2500, 2750, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22000, 24000, 25000, 26000, 28000, 30000, 35000, 40000, 45000, 50000
];

const ELECTRICAL_PLUGS = [
  '4-Pin Flat', '5-Pin Flat', '6-Pin Round', '7-Pin Round (RV Style)', '7-Pin Round (Commercial)', '13-Pin (European)', 'None'
];

const BALL_SIZES = ['1-7/8"', '2"', '2-5/16"', 'N/A'];

const HITCH_CONNECTIONS = ['Bumper Pull', 'Gooseneck', 'Fifth Wheel', 'Pintle'];

const AXLE_CONFIGURATIONS = ['Single Axle', 'Tandem Axle', 'Triple Axle', 'Quad Axle'];

const EQUIPMENT_MAKES = [
  'Bobcat', 'Caterpillar (CAT)', 'John Deere', 'Kubota', 'Case', 'New Holland', 'Takeuchi', 'Yanmar', 'Hitachi', 'Komatsu', 'Volvo', 'JCB', 'KIOTI', 'Mahindra', 'Massey Ferguson', 'Generac', 'Honda', 'Kohler', 'Genie', 'JLG', 'Skyjack', 'Wacker Neuson', 'Multiquip', 'Lincoln Electric', 'Miller', 'Other'
];

const HORSEPOWER_VALUES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 74, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 175, 200, 225, 250, 275, 300, 350, 400, 450, 500, 600
];

const DUMPSTER_SIZES = ['2', '4', '6', '8', '10', '12', '15', '20', '25', '30', '40'];

const DUMPSTER_WEIGHT_LIMITS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20];

const FUEL_TYPES = ['Diesel', 'Gasoline', 'Electric', 'Propane', 'Hybrid', 'N/A'];

const DELIVERY_RANGES = [10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];

const RENTAL_PERIODS = ['3 days', '5 days', '7 days', '10 days', '14 days', 'Custom'];

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
  // Strategic Fields
  asset_class?: string;
  sub_category?: string;
  year_make_model?: string;
  year_manufactured?: number;
  make_brand?: string;
  model_name?: string;

  // Weights (Common)
  gvwr_lbs?: string;
  payload_capacity?: string;
  empty_weight?: string;

  // Dimensions (Common)
  length_ft?: string;
  width_ft?: string;
  dimensions?: string;

  // Trailer Specific
  hitch_connection?: string;
  ball_size?: string;
  electrical_plug?: string;
  axle_configuration?: string;
  tow_capacity?: string;

  // Equipment Specific
  engine_horsepower?: string;
  fuel_type?: string;
  hours?: string;
  dig_depth?: string;
  reach?: string;
  lift_height?: string;
  lift_capacity?: string;
  bucket_attachment_width?: string;
  pto_horsepower?: string;
  three_point_hitch?: string;
  platform_height?: string;
  output_power?: string;

  // Dumpster Specific
  dumpster_size?: string;
  weight_limit_tons?: string;
  gate_type?: string;
  material?: string;
  tarp_cover?: string;
  service_area_radius?: number;
  rental_period_included?: string;
  accepted_materials?: string[];
  prohibited_materials?: string;

  // Delivery/Pickup
  delivery_available?: boolean;
  delivery_range_miles?: number;
  delivery_fee?: string;
  pickup_available?: boolean;
  operator_required?: boolean;

  // Rates
  hourly_rate?: number;
  daily_rate?: number;
  three_day_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;

  // Fees (Dumpster)
  base_rental_rate?: number;
  additional_day_rate?: number;
  overage_fee_per_ton?: number;
  pickup_fee?: number;

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
  year_manufactured: new Date().getFullYear(),
  make_brand: '',
  model_name: '',
  gvwr_lbs: '',
  payload_capacity: '',
  empty_weight: '',
  length_ft: '',
  width_ft: '',
  dimensions: '',
  hitch_connection: '',
  ball_size: '',
  electrical_plug: '',
  axle_configuration: '',
  daily_rate: 0,
  three_day_rate: 0,
  weekly_rate: 0,
  monthly_rate: 0,
  features: [],
  youtube_url: '',
  tow_capacity: '',
  delivery_available: false,
  pickup_available: true,
  operator_required: false,
  accepted_materials: [],
};

export default function ServicesEditor({ listingId }: ServicesEditorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>(emptyService);
  const [saving, setSaving] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFeature, setNewFeature] = useState('');
  const [addingNewAsset, setAddingNewAsset] = useState(false);
  const [selectedRigType, setSelectedRigType] = useState<string | null>(null);

  // Dynamically find the current service in the state to get live updates (for photos, etc.)
  const liveService = editingService?.id
    ? (services && Array.isArray(services) ? services.find(s => s.id === editingService.id) : null)
    : null;
  const activePhotos = liveService?.photos || editingService?.photos || [];

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
    setExpandedService(null);
    setPendingPhotos([]);
    setPhotoPreviews([]);
    setAddingNewAsset(true);
    setSelectedRigType(null);
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      ...emptyService,
      ...service,
      features: service.features || [],
    });
    setAddingNewAsset(false);
    setSelectedRigType(service.asset_class || null);
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
        year_make_model: `${formData.year_manufactured || ''} ${formData.make_brand || ''} ${formData.model_name || ''}`.trim() || formData.year_make_model || null,
        year_manufactured: formData.year_manufactured || null,
        make_brand: formData.make_brand || null,
        model_name: formData.model_name || null,
        dumpster_size: formData.dumpster_size || null,
        length_ft: formData.length_ft || null,
        payload_capacity: formData.payload_capacity || null,
        empty_weight: formData.empty_weight || null,
        dimensions: formData.dimensions || null,
        hitch_connection: formData.hitch_connection || null,
        ball_size: formData.ball_size || null,
        electrical_plug: formData.electrical_plug || null,
        axle_configuration: formData.axle_configuration || null,
        tow_capacity: formData.tow_capacity || null,
        gvwr_lbs: formData.gvwr_lbs || null,
        width_ft: formData.width_ft || null,
        fuel_type: formData.fuel_type || null,
        engine_horsepower: formData.engine_horsepower || null,
        hours: formData.hours || null,
        weight_limit_tons: formData.weight_limit_tons || null,
        gate_type: formData.gate_type || null,
        delivery_available: formData.delivery_available || false,
        delivery_range_miles: formData.delivery_range_miles || null,
        delivery_fee: formData.delivery_fee || null,
        pickup_available: formData.pickup_available || false,
        operator_required: formData.operator_required || false,
        dig_depth: formData.dig_depth || null,
        reach: formData.reach || null,
        lift_height: formData.lift_height || null,
        lift_capacity: formData.lift_capacity || null,
        bucket_attachment_width: formData.bucket_attachment_width || null,
        pto_horsepower: formData.pto_horsepower || null,
        three_point_hitch: formData.three_point_hitch || null,
        daily_rate: formData.daily_rate || null,
        three_day_rate: formData.three_day_rate || null,
        weekly_rate: formData.weekly_rate || null,
        monthly_rate: formData.monthly_rate || null,
        features: (formData.features && Array.isArray(formData.features) && formData.features.length > 0) ? formData.features : null,
        youtube_url: formData.youtube_url || null,
      };

      let newServiceId = editingService?.id;

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
        const { data, error } = await supabase
          .from('business_services')
          .insert({
            listing_id: listingId,
            ...serviceData,
            display_order: (services?.length || 0)
          })
          .select()
          .single();

        if (error) throw error;
        newServiceId = data.id;
        toast.success('Asset deployed');
      }

      // Handle pending photo uploads if it's a new service
      if (!editingService?.id && newServiceId && pendingPhotos.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          for (let i = 0; i < pendingPhotos.length; i++) {
            const file = pendingPhotos[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const storagePath = `${user.id}/${listingId}/services/${newServiceId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('business-photos')
              .upload(storagePath, file);

            if (!uploadError) {
              await supabase
                .from('service_photos')
                .insert({
                  service_id: newServiceId,
                  storage_path: storagePath,
                  file_name: file.name,
                  file_size: file.size,
                  is_primary: i === 0,
                  display_order: i
                });
            } else {
              console.error('Error uploading photo:', uploadError);
              toast.error(`Failed to upload photo ${file.name}`);
            }
          }
          toast.success(`${pendingPhotos.length} photos uploaded`);
        }
      }

      setDialogOpen(false);
      setAddingNewAsset(false);
      setSelectedRigType(null);
      fetchServices();
      setPendingPhotos([]);
      setPhotoPreviews([]);
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setPendingPhotos(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePendingPhoto = (index: number) => {
    setPendingPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto !bg-[#1a1f2e] border-t-4 border-t-primary">
              <DialogHeader className="border-b border-border pb-4">
                <DialogTitle className="text-2xl font-bold uppercase italic text-white tracking-wide">
                  {editingService ? 'Refit Combat Asset' : 'Deploy New Strategic Asset'}
                </DialogTitle>
                <p className="text-sm uppercase tracking-widest text-white/90">
                  Fleet Operational Logistics Hub
                </p>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {addingNewAsset && !selectedRigType && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                    <Button
                      onClick={() => {
                        setSelectedRigType('trailer');
                        setFormData({ ...emptyService, asset_class: 'trailer', sub_category: '' });
                      }}
                      className="h-auto min-h-[14rem] flex flex-col items-center justify-center gap-4 bg-[#0f1219] hover:bg-primary/20 border-2 border-border hover:border-primary transition-all group p-6 text-center whitespace-normal"
                    >
                      <div className="h-32 w-32 mx-auto flex items-center justify-center bg-slate-200 rounded-full overflow-hidden transition-transform group-hover:scale-110 shadow-inner">
                        <img
                          src="/assets/categories/trailer_v4.png"
                          alt="Trailer Asset"
                          className="h-full w-full object-contain mix-blend-multiply transition-transform"
                        />
                      </div>
                      <div>
                        <span className="block text-xl font-bold uppercase italic tracking-wide">Trailers</span>
                        <span className="text-sm text-white/85 uppercase tracking-wide leading-relaxed mt-2 block">
                          Utility, dump, enclosed, car<br />haulers, and specialty trailers
                        </span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedRigType('equipment');
                        setFormData({ ...emptyService, asset_class: 'equipment', sub_category: '' });
                      }}
                      className="h-auto min-h-[14rem] flex flex-col items-center justify-center gap-4 bg-[#0f1219] hover:bg-primary/20 border-2 border-border hover:border-primary transition-all group p-6 text-center whitespace-normal"
                    >
                      <div className="h-32 w-32 mx-auto flex items-center justify-center bg-slate-200 rounded-full overflow-hidden transition-transform group-hover:scale-110 shadow-inner">
                        <img
                          src="/assets/categories/equipment_v3.png"
                          alt="Equipment Asset"
                          className="h-full w-full object-contain mix-blend-multiply transition-transform"
                        />
                      </div>
                      <div>
                        <span className="block text-xl font-bold uppercase italic tracking-wide">Equipment</span>
                        <span className="text-sm text-white/85 uppercase tracking-wide leading-relaxed mt-2 block">
                          Earthmoving, tractors, generators,<br />compaction, and aerial equipment
                        </span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedRigType('dumpster');
                        setFormData({ ...emptyService, asset_class: 'dumpster', sub_category: '' });
                      }}
                      className="h-auto min-h-[14rem] flex flex-col items-center justify-center gap-4 bg-[#0f1219] hover:bg-primary/20 border-2 border-border hover:border-primary transition-all group p-6 text-center whitespace-normal"
                    >
                      <div className="h-32 w-32 mx-auto flex items-center justify-center bg-slate-200 rounded-full overflow-hidden transition-transform group-hover:scale-110 shadow-inner">
                        <img
                          src="/assets/categories/dumpster_v3.png"
                          alt="Dumpster Asset"
                          className="h-full w-full object-contain mix-blend-multiply transition-transform"
                        />
                      </div>
                      <div>
                        <span className="block text-xl font-bold uppercase italic tracking-wide">Dumpsters</span>
                        <span className="text-sm text-white/85 uppercase tracking-wide leading-relaxed mt-2 block">
                          Roll-off, front-load,<br />and rear-load dumpsters
                        </span>
                      </div>
                    </Button>
                  </div>
                )}

                {(!addingNewAsset || selectedRigType) && (
                  <>
                    {/* MISSION BRIEFING */}
                    <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                        Mission Briefing
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-sm uppercase tracking-wider text-white/90">
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
                          <Label className="text-sm uppercase tracking-wider text-white/90">
                            Class
                          </Label>
                          <Input
                            value={formData.asset_class?.toUpperCase()}
                            disabled
                            className="bg-background/50 border-border cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm uppercase tracking-wider text-white/90">
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
                        <Label className="text-sm uppercase tracking-wider text-white/90">
                          Operational Performance Brief (Description)
                        </Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Provide an exhaustive tactical briefing on this equipment's capabilities, maintenance status, and specific use cases..."
                          rows={4}
                          className="bg-background border-border"
                        />
                        <AIDescriptionEnhancer
                          currentDescription={formData.description}
                          itemName={formData.service_name}
                          itemType={formData.sub_category}
                          features={formData.features}
                          specs={{
                            yearMakeModel: `${formData.year_manufactured || ''} ${formData.make_brand || ''} ${formData.model_name || ''} ${formData.dumpster_size || ''}`.trim(),
                            length: formData.length_ft || '',
                            payload: formData.payload_capacity || '',
                            towCapacity: formData.tow_capacity || '',
                          }}
                          onUseDescription={(desc) => setFormData({ ...formData, description: desc })}
                        />
                      </div>
                    </div>

                    {/* COMBAT SPECIFICATIONS */}
                    <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                      {formData.asset_class === 'trailer' && (
                        <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                          {formData.service_name || 'Trailer'} Specifications
                        </h3>
                      )}

                      {formData.asset_class === 'trailer' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Year</Label>
                            <Select
                              value={formData.year_manufactured?.toString()}
                              onValueChange={(val) => setFormData({ ...formData, year_manufactured: parseInt(val) })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Make/Brand</Label>
                            <Input
                              value={formData.make_brand || ''}
                              onChange={(e) => setFormData({ ...formData, make_brand: e.target.value })}
                              placeholder="Big Tex, PJ, etc."
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Model</Label>
                            <Input
                              value={formData.model_name || ''}
                              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                              placeholder="70PI, DT714, etc."
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Length (FT)</Label>
                            <Select
                              value={formData.length_ft || ''}
                              onValueChange={(val) => setFormData({ ...formData, length_ft: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Length" />
                              </SelectTrigger>
                              <SelectContent>
                                {TRAILER_LENGTHS.map(len => (
                                  <SelectItem key={len} value={len}>{len} ft</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Width (FT) <span className="text-white/30">(Optional)</span></Label>
                            <Select
                              value={formData.width_ft || ''}
                              onValueChange={(val) => setFormData({ ...formData, width_ft: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Width" />
                              </SelectTrigger>
                              <SelectContent>
                                {TRAILER_WIDTHS.map(width => (
                                  <SelectItem key={width} value={width}>{width} ft</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">GVWR (LBS)</Label>
                            <Select
                              value={formData.gvwr_lbs || ''}
                              onValueChange={(val) => setFormData({ ...formData, gvwr_lbs: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="GVWR" />
                              </SelectTrigger>
                              <SelectContent>
                                {WEIGHT_VALUES.map(val => (
                                  <SelectItem key={val} value={val.toString()}>{val.toLocaleString()} lbs</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Empty Weight (LBS)</Label>
                            <Select
                              value={formData.empty_weight || ''}
                              onValueChange={(val) => setFormData({ ...formData, empty_weight: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Empty Weight" />
                              </SelectTrigger>
                              <SelectContent>
                                {WEIGHT_VALUES.map(val => (
                                  <SelectItem key={val} value={val.toString()}>{val.toLocaleString()} lbs</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Payload Capacity (LBS)</Label>
                            <Select
                              value={formData.payload_capacity || ''}
                              onValueChange={(val) => setFormData({ ...formData, payload_capacity: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Payload" />
                              </SelectTrigger>
                              <SelectContent>
                                {WEIGHT_VALUES.map(val => (
                                  <SelectItem key={val} value={val.toString()}>{val.toLocaleString()} lbs</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Hitch Connection</Label>
                            <Select
                              value={formData.hitch_connection || ''}
                              onValueChange={(val) => setFormData({ ...formData, hitch_connection: val, ball_size: val !== 'Bumper Pull' ? 'N/A' : formData.ball_size })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Connection Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {HITCH_CONNECTIONS.map(conn => (
                                  <SelectItem key={conn} value={conn}>{conn}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {formData.hitch_connection === 'Bumper Pull' && (
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Ball Size (IN)</Label>
                              <Select
                                value={formData.ball_size || ''}
                                onValueChange={(val) => setFormData({ ...formData, ball_size: val })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Ball Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BALL_SIZES.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Electrical Plug</Label>
                            <Select
                              value={formData.electrical_plug || ''}
                              onValueChange={(val) => setFormData({ ...formData, electrical_plug: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Plug Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ELECTRICAL_PLUGS.map(plug => (
                                  <SelectItem key={plug} value={plug}>{plug}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Axle Configuration</Label>
                            <Select
                              value={formData.axle_configuration || ''}
                              onValueChange={(val) => setFormData({ ...formData, axle_configuration: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Configuration" />
                              </SelectTrigger>
                              <SelectContent>
                                {AXLE_CONFIGURATIONS.map(conf => (
                                  <SelectItem key={conf} value={conf}>{conf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {formData.asset_class === 'equipment' && (
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-2">
                          {formData.service_name || 'Equipment'} Specifications
                        </h4>
                      )}

                      {formData.asset_class === 'equipment' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Year</Label>
                              <Select
                                value={formData.year_manufactured?.toString()}
                                onValueChange={(val) => setFormData({ ...formData, year_manufactured: parseInt(val) })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Make</Label>
                              <Select
                                value={formData.make_brand || ''}
                                onValueChange={(val) => setFormData({ ...formData, make_brand: val })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Select Make" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EQUIPMENT_MAKES.map(make => (
                                    <SelectItem key={make} value={make}>{make}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Model</Label>
                              <Input
                                value={formData.model_name || ''}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                placeholder="S650, 335, etc."
                                className="bg-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Fuel Type</Label>
                              <Select
                                value={formData.fuel_type || ''}
                                onValueChange={(val) => setFormData({ ...formData, fuel_type: val })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Fuel Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FUEL_TYPES.map(fuel => (
                                    <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Operating Weight (LBS)</Label>
                              <Select
                                value={formData.empty_weight || ''}
                                onValueChange={(val) => setFormData({ ...formData, empty_weight: val })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Weight" />
                                </SelectTrigger>
                                <SelectContent>
                                  {WEIGHT_VALUES.map(val => (
                                    <SelectItem key={val} value={val.toString()}>{val.toLocaleString()} lbs</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm uppercase tracking-wider text-white/95">Horsepower</Label>
                              <Select
                                value={formData.engine_horsepower || ''}
                                onValueChange={(val) => setFormData({ ...formData, engine_horsepower: val })}
                              >
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="HP" />
                                </SelectTrigger>
                                <SelectContent>
                                  {HORSEPOWER_VALUES.map(hp => (
                                    <SelectItem key={hp} value={hp.toString()}>{hp} HP</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between text-sm uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5 border border-primary/20">
                                Additional Specifications
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">Dig Depth</Label>
                                  <Input
                                    value={formData.dig_depth || ''}
                                    onChange={(e) => setFormData({ ...formData, dig_depth: e.target.value })}
                                    placeholder="e.g. 10' 4''"
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">Reach</Label>
                                  <Input
                                    value={formData.reach || ''}
                                    onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                                    placeholder="e.g. 18' 6''"
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">Lift Height</Label>
                                  <Input
                                    value={formData.lift_height || ''}
                                    onChange={(e) => setFormData({ ...formData, lift_height: e.target.value })}
                                    placeholder="e.g. 12'"
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">Lift Capacity</Label>
                                  <Input
                                    value={formData.lift_capacity || ''}
                                    onChange={(e) => setFormData({ ...formData, lift_capacity: e.target.value })}
                                    placeholder="e.g. 3,000 lbs"
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">Att. Width</Label>
                                  <Input
                                    value={formData.bucket_attachment_width || ''}
                                    onChange={(e) => setFormData({ ...formData, bucket_attachment_width: e.target.value })}
                                    placeholder='e.g. 74"'
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">PTO HP</Label>
                                  <Input
                                    value={formData.pto_horsepower || ''}
                                    onChange={(e) => setFormData({ ...formData, pto_horsepower: e.target.value })}
                                    placeholder="e.g. 45 HP"
                                    className="bg-background border-border h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase tracking-widest text-white/60">3-Point Hitch</Label>
                                  <Select
                                    value={formData.three_point_hitch || ''}
                                    onValueChange={(val) => setFormData({ ...formData, three_point_hitch: val })}
                                  >
                                    <SelectTrigger className="bg-background border-border h-8 text-xs">
                                      <SelectValue placeholder="Hitch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['Category 0', 'Category 1', 'Category 2', 'Category 3', 'N/A'].map(h => (
                                        <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}

                      {formData.asset_class === 'dumpster' && (
                        <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                          {formData.service_name || 'Dumpster'} Specifications
                        </h3>
                      )}

                      {formData.asset_class === 'dumpster' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Size (CY)</Label>
                            <Select
                              value={formData.dumpster_size || ''}
                              onValueChange={(val) => setFormData({ ...formData, dumpster_size: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {DUMPSTER_SIZES.map(size => (
                                  <SelectItem key={size} value={size}>{size} Yards</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Weight Limit (Tons)</Label>
                            <Select
                              value={formData.weight_limit_tons || ''}
                              onValueChange={(val) => setFormData({ ...formData, weight_limit_tons: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Limit" />
                              </SelectTrigger>
                              <SelectContent>
                                {DUMPSTER_WEIGHT_LIMITS.map(limit => (
                                  <SelectItem key={limit} value={limit.toString()}>{limit} Tons</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Gate Type</Label>
                            <Select
                              value={formData.gate_type || ''}
                              onValueChange={(val) => setFormData({ ...formData, gate_type: val })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Gate" />
                              </SelectTrigger>
                              <SelectContent>
                                {['Swing Door', 'Barn Door', 'No Gate', 'N/A'].map(g => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm uppercase tracking-wider text-white/95">Dimensions</Label>
                            <Input
                              value={formData.dimensions || ''}
                              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                              placeholder="e.g. 22' x 8' x 4'"
                              className="bg-background border-border"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {(formData.asset_class === 'equipment' || formData.asset_class === 'dumpster') && (
                      <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                        <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                          Delivery Logistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-background/30 rounded border border-border/50">
                              <div className="space-y-1">
                                <Label className="text-base font-bold uppercase tracking-wider">Delivery Available</Label>
                                <p className="text-sm text-white/95 uppercase tracking-wide">Can you drop this off to the customer?</p>
                              </div>
                              <Switch
                                checked={formData.delivery_available}
                                onCheckedChange={(checked) => setFormData({ ...formData, delivery_available: checked })}
                              />
                            </div>
                            {formData.delivery_available && (
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                  <Label className="text-sm uppercase tracking-wider text-white/95">Range (Miles)</Label>
                                  <Select
                                    value={formData.delivery_range_miles?.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, delivery_range_miles: parseInt(val) })}
                                  >
                                    <SelectTrigger className="bg-background border-border">
                                      <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DELIVERY_RANGES.map(range => (
                                        <SelectItem key={range} value={range.toString()}>{range} Miles</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm uppercase tracking-wider text-white/95">Base Delivery Fee ($)</Label>
                                  <Input
                                    value={formData.delivery_fee || ''}
                                    onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                    placeholder="e.g. 75"
                                    className="bg-background border-border"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-background/30 rounded border border-border/50">
                              <div className="space-y-1">
                                <Label className="text-base font-bold uppercase tracking-wider">Pickup Available</Label>
                                <p className="text-sm text-white/95 uppercase tracking-wide">Can the customer tow this themselves?</p>
                              </div>
                              <Switch
                                checked={formData.pickup_available}
                                onCheckedChange={(checked) => setFormData({ ...formData, pickup_available: checked })}
                              />
                            </div>
                            {formData.asset_class === 'equipment' && (
                              <div className="flex items-center justify-between p-3 bg-background/30 rounded border border-border/50">
                                <div className="space-y-1">
                                  <Label className="text-base font-bold uppercase tracking-wider">Operator Required</Label>
                                  <p className="text-sm text-white/95 uppercase tracking-wide">Enforce professional operation only?</p>
                                </div>
                                <Switch
                                  checked={formData.operator_required}
                                  onCheckedChange={(checked) => setFormData({ ...formData, operator_required: checked })}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MISSION RATES */}
                    <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-bold uppercase italic text-primary mb-4 tracking-wide">
                        Mission Rates
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm uppercase tracking-wider text-white/95">
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
                          <Label className="text-sm uppercase tracking-wider text-white/95">
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
                          <Label className="text-sm uppercase tracking-wider text-white/95">
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
                          <Label className="text-sm uppercase tracking-wider text-white/95">
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
                        </div>

                        <div className="space-y-4">
                          {formData.asset_class === 'trailer' && (
                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-background/50 rounded-lg border border-border/30">
                              <p className="w-full text-sm uppercase tracking-wider text-white/95 mb-1">Common Tactical Gear</p>
                              {COMMON_TRAILER_FEATURES.map(feat => (
                                <Button
                                  key={feat}
                                  variant="outline"
                                  size="sm"
                                  disabled={formData.features?.includes(feat)}
                                  onClick={() => setFormData({
                                    ...formData,
                                    features: [...(formData.features || []), feat]
                                  })}
                                  className="h-8 text-sm uppercase tracking-wide border-primary/40 text-white hover:border-primary hover:bg-primary/20"
                                >
                                  + {feat}
                                </Button>
                              ))}
                            </div>
                          )}
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
                            {(!formData.features || !Array.isArray(formData.features) || formData.features.length === 0) && (
                              <p className="text-sm text-white/90 text-center py-4 uppercase tracking-wide">
                                No features added yet
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-border/30">
                            <Input
                              value={newFeature}
                              onChange={(e) => setNewFeature(e.target.value)}
                              placeholder="Add feature..."
                              className="flex-1 h-10 text-sm bg-background border-border"
                              onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                            />
                            <Button
                              size="sm"
                              onClick={addFeature}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide border-none px-6"
                            >
                              + Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* ASSET VISUAL GALLERY */}
                      <div className="bg-[#0f1219] rounded-lg p-6 border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold uppercase italic text-primary tracking-wide">
                            Asset Visual Gallery
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {!editingService ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                {photoPreviews.map((preview, idx) => (
                                  <div key={idx} className="relative aspect-square rounded overflow-hidden border border-border group">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removePendingPhoto(idx)}
                                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-square rounded border border-dashed border-primary/40 flex flex-col items-center justify-center hover:bg-primary/5 transition-colors"
                                >
                                  <Upload className="h-5 w-5 text-primary mb-1" />
                                  <span className="text-xs uppercase font-bold text-primary">Add</span>
                                </button>
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                              />
                              <p className="text-sm text-white/90 uppercase tracking-wider text-center">
                                Tactical photos will be uploaded upon deployment
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <ServicePhotoUpload
                                serviceId={editingService.id!}
                                listingId={listingId}
                                photos={activePhotos}
                                onPhotosChange={fetchServices}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BRIEFING */}
                    <div className="bg-[#0f1219] rounded-lg p-6 border border-border mt-6">
                      <div className="space-y-2 pt-2">
                        <Label className="text-sm uppercase tracking-wider text-white/90">
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
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {(!services || !Array.isArray(services) || services.length === 0) ? (
          <p className="text-sm text-white/60 text-center py-8 uppercase tracking-wide">
            No assets deployed. Deploy your rental fleet to attract more customers.
          </p>
        ) : (
          <div className="space-y-3">
            {Array.isArray(services) && services.map((service) => (
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
                            src={getPublicUrl(service.photos.find(p => p.is_primary)?.storage_path || (service.photos[0] ? service.photos[0].storage_path : ''))}
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
                          {service.photos && Array.isArray(service.photos) && service.photos.length > 0 && (
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
    </Card >
  );
}
