import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Copy } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30', '00:00'
];

interface DayHours {
  day_of_week: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}

interface BusinessHoursEditorProps {
  listingId: string;
}

export default function BusinessHoursEditor({ listingId }: BusinessHoursEditorProps) {
  const [hours, setHours] = useState<DayHours[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      const { data } = await supabase
        .from('business_hours')
        .select('*')
        .eq('listing_id', listingId)
        .order('day_of_week');

      if (data && data.length > 0) {
        setHours(data.map(h => ({
          day_of_week: h.day_of_week,
          is_closed: h.is_closed || false,
          open_time: h.open_time || '09:00',
          close_time: h.close_time || '17:00'
        })));
      } else {
        // Initialize with default hours
        setHours(DAYS.map((_, index) => ({
          day_of_week: index,
          is_closed: index === 0, // Sunday closed by default
          open_time: '09:00',
          close_time: '17:00'
        })));
      }
      setLoading(false);
    };

    fetchHours();
  }, [listingId]);

  const updateDay = (dayIndex: number, field: keyof DayHours, value: any) => {
    setHours(prev => prev.map(h => 
      h.day_of_week === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  const copyToAllDays = () => {
    const mondayHours = hours.find(h => h.day_of_week === 1);
    if (mondayHours) {
      setHours(prev => prev.map(h => ({
        ...h,
        is_closed: h.day_of_week === 0 ? h.is_closed : mondayHours.is_closed,
        open_time: mondayHours.open_time,
        close_time: mondayHours.close_time
      })));
      toast.success('Hours copied to all weekdays');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing hours
      await supabase
        .from('business_hours')
        .delete()
        .eq('listing_id', listingId);

      // Insert new hours
      const { error } = await supabase
        .from('business_hours')
        .insert(hours.map(h => ({
          listing_id: listingId,
          day_of_week: h.day_of_week,
          is_closed: h.is_closed,
          open_time: h.is_closed ? null : h.open_time,
          close_time: h.is_closed ? null : h.close_time
        })));

      if (error) throw error;
      toast.success('Business hours saved');
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error('Failed to save business hours');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">Loading hours...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hours of Operation
        </CardTitle>
        <CardDescription>
          Set your business hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" size="sm" onClick={copyToAllDays} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Monday hours to all weekdays
        </Button>

        <div className="space-y-3">
          {hours.map((day) => (
            <div key={day.day_of_week} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="w-24 font-medium">{DAYS[day.day_of_week]}</div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`closed-${day.day_of_week}`}
                  checked={day.is_closed}
                  onCheckedChange={(checked) => updateDay(day.day_of_week, 'is_closed', checked)}
                />
                <Label htmlFor={`closed-${day.day_of_week}`} className="text-sm">Closed</Label>
              </div>

              {!day.is_closed && (
                <>
                  <Select
                    value={day.open_time}
                    onValueChange={(value) => updateDay(day.day_of_week, 'open_time', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={`open-${time}`} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-muted-foreground">to</span>

                  <Select
                    value={day.close_time}
                    onValueChange={(value) => updateDay(day.day_of_week, 'close_time', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={`close-${time}`} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Hours'}
        </Button>
      </CardContent>
    </Card>
  );
}
