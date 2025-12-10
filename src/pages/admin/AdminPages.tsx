import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedPages, setEditedPages] = useState<Record<string, Page>>({});

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('slug');

    if (data && !error) {
      setPages(data);
      const edited: Record<string, Page> = {};
      data.forEach(p => { edited[p.slug] = { ...p }; });
      setEditedPages(edited);
    }
    setLoading(false);
  };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    const page = editedPages[slug];
    
    const { error } = await supabase
      .from('pages')
      .update({
        title: page.title,
        content: page.content,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) {
      toast.error("Failed to save page");
    } else {
      toast.success("Page saved successfully");
      fetchPages();
    }
    setSaving(null);
  };

  const updatePage = (slug: string, field: keyof Page, value: string) => {
    setEditedPages(prev => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Page Manager</h1>
        <p className="text-muted-foreground mt-1">Edit static pages like About, Privacy Policy, and Terms of Service</p>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          {pages.map(page => (
            <TabsTrigger key={page.slug} value={page.slug} className="capitalize">
              {page.slug}
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map(page => (
          <TabsContent key={page.slug} value={page.slug}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Edit {page.title}
                </CardTitle>
                <CardDescription>
                  Last updated: {new Date(page.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Page Title</label>
                    <Input
                      value={editedPages[page.slug]?.title || ''}
                      onChange={(e) => updatePage(page.slug, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Title (SEO)</label>
                    <Input
                      value={editedPages[page.slug]?.meta_title || ''}
                      onChange={(e) => updatePage(page.slug, 'meta_title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description (SEO)</label>
                  <Input
                    value={editedPages[page.slug]?.meta_description || ''}
                    onChange={(e) => updatePage(page.slug, 'meta_description', e.target.value)}
                    placeholder="Brief description for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (Markdown)</label>
                  <Textarea
                    value={editedPages[page.slug]?.content || ''}
                    onChange={(e) => updatePage(page.slug, 'content', e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports Markdown: ## for headings, - for lists, **bold**, [link](url)
                  </p>
                </div>

                <Button 
                  onClick={() => handleSave(page.slug)} 
                  disabled={saving === page.slug}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === page.slug ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
