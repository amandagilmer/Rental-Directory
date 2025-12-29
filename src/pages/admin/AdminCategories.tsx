import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'folder',
    is_active: true
  });

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      is_active: category.is_active
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'folder',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            icon: formData.icon,
            is_active: formData.is_active
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated');
      } else {
        const maxOrder = Math.max(...categories.map(c => c.display_order), 0);
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            icon: formData.icon,
            is_active: formData.is_active,
            display_order: maxOrder + 1
          });

        if (error) throw error;
        toast.success('Category created');
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete category');
      return;
    }

    toast.success('Category deleted');
    fetchCategories();
  };

  const toggleActive = async (category: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      toast.error('Failed to update category');
      return;
    }

    fetchCategories();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage rental categories that appear across the platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Boat Rental"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL-friendly)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="boat-rental"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="truck, hammer, caravan, container"
                />
                <p className="text-xs text-muted-foreground">Use Lucide icon names: truck, hammer, caravan, container, etc.</p>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{category.icon}</TableCell>
                  <TableCell>
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => toggleActive(category)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
