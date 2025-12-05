import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, X, Plus } from 'lucide-react';

const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 75, 100];

interface ServiceAreaEditorProps {
  listingId: string;
}

export default function ServiceAreaEditor({ listingId }: ServiceAreaEditorProps) {
  const [areaType, setAreaType] = useState<'zip_code' | 'radius'>('radius');
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [newZipCode, setNewZipCode] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceArea = async () => {
      const { data } = await supabase
        .from('service_areas')
        .select('*')
        .eq('listing_id', listingId)
        .maybeSingle();

      if (data) {
        setAreaType(data.area_type as 'zip_code' | 'radius');
        setZipCodes(data.zip_codes || []);
        setRadiusMiles(data.radius_miles || 25);
      }
      setLoading(false);
    };

    fetchServiceArea();
  }, [listingId]);

  const addZipCode = () => {
    const zip = newZipCode.trim();
    if (!zip) return;
    
    if (!/^\d{5}$/.test(zip)) {
      toast.error('Please enter a valid 5-digit zip code');
      return;
    }

    if (zipCodes.includes(zip)) {
      toast.error('This zip code is already added');
      return;
    }

    setZipCodes([...zipCodes, zip]);
    setNewZipCode('');
  };

  const removeZipCode = (zip: string) => {
    setZipCodes(zipCodes.filter(z => z !== zip));
  };

  const handleSave = async () => {
    if (areaType === 'zip_code' && zipCodes.length === 0) {
      toast.error('Please add at least one zip code');
      return;
    }

    setSaving(true);
    try {
      // Check if service area exists
      const { data: existing } = await supabase
        .from('service_areas')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle();

      const serviceAreaData = {
        listing_id: listingId,
        area_type: areaType,
        zip_codes: areaType === 'zip_code' ? zipCodes : null,
        radius_miles: areaType === 'radius' ? radiusMiles : null,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('service_areas')
          .update(serviceAreaData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_areas')
          .insert(serviceAreaData);

        if (error) throw error;
      }

      toast.success('Service area saved');
    } catch (error) {
      console.error('Error saving service area:', error);
      toast.error('Failed to save service area');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">Loading service area...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Service Area
        </CardTitle>
        <CardDescription>
          Define where you provide services or deliver rentals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={areaType}
          onValueChange={(value) => setAreaType(value as 'zip_code' | 'radius')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="radius" id="radius" />
            <Label htmlFor="radius">Set radius from business address</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="zip_code" id="zip_code" />
            <Label htmlFor="zip_code">Specify zip codes</Label>
          </div>
        </RadioGroup>

        {areaType === 'radius' && (
          <div className="space-y-2">
            <Label>Service Radius</Label>
            <Select
              value={radiusMiles.toString()}
              onValueChange={(value) => setRadiusMiles(parseInt(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map(miles => (
                  <SelectItem key={miles} value={miles.toString()}>
                    {miles} miles
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You'll serve customers within {radiusMiles} miles of your business address
            </p>
          </div>
        )}

        {areaType === 'zip_code' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                placeholder="Enter zip code"
                maxLength={5}
                className="w-32"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addZipCode())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addZipCode}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {zipCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {zipCodes.map(zip => (
                  <Badge key={zip} variant="secondary" className="gap-1">
                    {zip}
                    <button onClick={() => removeZipCode(zip)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {zipCodes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No zip codes added yet. Add the zip codes where you provide services.
              </p>
            )}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Service Area'}
        </Button>
      </CardContent>
    </Card>
  );
}
