import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Clock, CheckCircle, Bell } from 'lucide-react';

interface ReviewSettingsTabProps {
  listingId: string;
}

interface ReviewSettings {
  auto_send_enabled: boolean;
  auto_send_delay_hours: number;
  send_on_completion: boolean;
  reminder_enabled: boolean;
  reminder_delay_days: number;
}

const defaultSettings: ReviewSettings = {
  auto_send_enabled: true,
  auto_send_delay_hours: 48,
  send_on_completion: false,
  reminder_enabled: false,
  reminder_delay_days: 7,
};

export default function ReviewSettingsTab({ listingId }: ReviewSettingsTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReviewSettings>(defaultSettings);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [listingId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('review_settings')
        .select('*')
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          auto_send_enabled: data.auto_send_enabled ?? true,
          auto_send_delay_hours: data.auto_send_delay_hours ?? 48,
          send_on_completion: data.send_on_completion ?? false,
          reminder_enabled: data.reminder_enabled ?? false,
          reminder_delay_days: data.reminder_delay_days ?? 7,
        });
        setHasExistingSettings(true);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (hasExistingSettings) {
        const { error } = await supabase
          .from('review_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('listing_id', listingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_settings')
          .insert({
            listing_id: listingId,
            ...settings,
          });

        if (error) throw error;
        setHasExistingSettings(true);
      }

      toast({
        title: 'Settings saved',
        description: 'Your review automation settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Review Request Automation
          </CardTitle>
          <CardDescription>
            Configure how and when review requests are sent to your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time-based automation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-base font-medium">Time-Based Auto-Send</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send review requests after a set time period
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.auto_send_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auto_send_enabled: checked })
                }
              />
            </div>
            
            {settings.auto_send_enabled && (
              <div className="ml-8 flex items-center gap-3">
                <Label htmlFor="delay-hours" className="whitespace-nowrap">
                  Send after
                </Label>
                <Input
                  id="delay-hours"
                  type="number"
                  min={1}
                  max={168}
                  value={settings.auto_send_delay_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      auto_send_delay_hours: parseInt(e.target.value) || 48,
                    })
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            )}
          </div>

          {/* Status-based automation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <Label className="text-base font-medium">Send on Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a review request when you mark a lead as "completed"
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.send_on_completion}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, send_on_completion: checked })
                }
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <Label className="text-base font-medium">Follow-Up Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a reminder if no review is submitted after the initial request
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.reminder_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reminder_enabled: checked })
                }
              />
            </div>
            
            {settings.reminder_enabled && (
              <div className="ml-8 flex items-center gap-3">
                <Label htmlFor="reminder-days" className="whitespace-nowrap">
                  Send reminder after
                </Label>
                <Input
                  id="reminder-days"
                  type="number"
                  min={1}
                  max={30}
                  value={settings.reminder_delay_days}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      reminder_delay_days: parseInt(e.target.value) || 7,
                    })
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Time-Based:</strong> Review requests are automatically sent to customers after the specified number of hours from when they submit a quote request.
          </p>
          <p>
            <strong className="text-foreground">On Completion:</strong> When you update a lead's status to "completed" in your Lead Inbox, a review request will be sent immediately.
          </p>
          <p>
            <strong className="text-foreground">Reminders:</strong> If enabled, customers who haven't left a review will receive a gentle reminder after the specified number of days.
          </p>
          <p className="text-xs mt-4 text-muted-foreground/70">
            Note: Customers will only receive one review request per transaction. Enabling both time-based and on-completion will use whichever triggers first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
