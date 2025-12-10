import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, HelpCircle } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

const categories = ["General", "For Customers", "For Businesses", "Billing", "Technical"];

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    is_published: true
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (data && !error) {
      setFaqs(data);
    }
    setLoading(false);
  };

  const openDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        is_published: faq.is_published
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        category: "General",
        is_published: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error("Please fill in question and answer");
      return;
    }

    if (editingFaq) {
      const { error } = await supabase
        .from('faqs')
        .update({
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          is_published: formData.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingFaq.id);

      if (error) {
        toast.error("Failed to update FAQ");
      } else {
        toast.success("FAQ updated successfully");
        fetchFaqs();
      }
    } else {
      const maxOrder = Math.max(...faqs.map(f => f.display_order), 0);
      const { error } = await supabase
        .from('faqs')
        .insert({
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          is_published: formData.is_published,
          display_order: maxOrder + 1
        });

      if (error) {
        toast.error("Failed to create FAQ");
      } else {
        toast.success("FAQ created successfully");
        fetchFaqs();
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete FAQ");
    } else {
      toast.success("FAQ deleted successfully");
      fetchFaqs();
    }
  };

  const togglePublished = async (faq: FAQ) => {
    const { error } = await supabase
      .from('faqs')
      .update({ is_published: !faq.is_published })
      .eq('id', faq.id);

    if (error) {
      toast.error("Failed to update FAQ");
    } else {
      fetchFaqs();
    }
  };

  const moveOrder = async (faq: FAQ, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= faqs.length) return;

    const swapFaq = faqs[swapIndex];
    
    await supabase.from('faqs').update({ display_order: swapFaq.display_order }).eq('id', faq.id);
    await supabase.from('faqs').update({ display_order: faq.display_order }).eq('id', swapFaq.id);
    
    fetchFaqs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FAQ Manager</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Published</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.is_published ? "Visible on website" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingFaq ? "Save Changes" : "Add FAQ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            All FAQs ({faqs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24">Published</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq, index) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveOrder(faq, 'up')}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveOrder(faq, 'down')}
                        disabled={index === faqs.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{faq.question}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{faq.answer}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{faq.category}</span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={faq.is_published}
                      onCheckedChange={() => togglePublished(faq)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {faqs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No FAQs yet. Click "Add FAQ" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
