import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Zap, Trophy, Shield, Lightbulb, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NetworkEvent {
  id: string;
  event_type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const iconOptions = [
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'trophy', label: 'Trophy', icon: Trophy },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'lightbulb', label: 'Lightbulb', icon: Lightbulb },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'alert', label: 'Alert', icon: AlertTriangle },
];

const colorOptions = [
  { value: 'primary', label: 'Patriot Red' },
  { value: 'gold', label: 'Badge Gold' },
  { value: 'accent', label: 'Patriot Blue' },
  { value: 'success', label: 'Success Green' },
  { value: 'warning', label: 'Warning' },
];

export default function PatriotFeedManager() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NetworkEvent | null>(null);
  const [formData, setFormData] = useState({
    event_type: 'announcement',
    title: '',
    message: '',
    icon: 'zap',
    color: 'primary',
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('network_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('network_events')
          .update(formData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated');
      } else {
        const { error } = await supabase
          .from('network_events')
          .insert([formData]);

        if (error) throw error;
        toast.success('Event created');
      }

      setDialogOpen(false);
      setEditingEvent(null);
      setFormData({ event_type: 'announcement', title: '', message: '', icon: 'zap', color: 'primary' });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: NetworkEvent) => {
    setEditingEvent(event);
    setFormData({
      event_type: event.event_type,
      title: event.title,
      message: event.message,
      icon: event.icon,
      color: event.color,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;

    const { error } = await supabase
      .from('network_events')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Event deleted');
      fetchEvents();
    }
  };

  const toggleActive = async (event: NetworkEvent) => {
    const { error } = await supabase
      .from('network_events')
      .update({ is_active: !event.is_active })
      .eq('id', event.id);

    if (!error) {
      fetchEvents();
    }
  };

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.value === iconName);
    return found ? found.icon : Zap;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Patriot Feed Manager
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'New Patriot Feed Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="The message that will appear in the feed"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No feed events yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {events.map((event) => {
            const Icon = getIconComponent(event.icon);
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  event.is_active ? "border-border bg-muted/30" : "border-dashed border-muted opacity-50"
                )}
              >
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{event.message}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(event)}
                    className={cn("text-xs", event.is_active ? "text-green-600" : "text-muted-foreground")}
                  >
                    {event.is_active ? 'Active' : 'Inactive'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
