import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Privacy() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('pages')
        .select('content, title, updated_at')
        .eq('slug', 'privacy')
        .maybeSingle();
      
      setContent(data?.content || null);
      setLoading(false);
    };

    fetchContent();
  }, []);

  // Simple markdown to HTML conversion for basic formatting
  const renderContent = (markdown: string) => {
    return markdown
      .split('\n\n')
      .map((block, index) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
              {block.replace('## ', '')}
            </h2>
          );
        }
        if (block.startsWith('### ')) {
          const text = block.replace('### ', '');
          const idMatch = text.match(/\{#(.+?)\}/);
          const id = idMatch ? idMatch[1] : undefined;
          const cleanText = text.replace(/\s*\{#.+?\}/, '');
          return (
            <h3 key={index} id={id} className="text-xl font-semibold text-foreground mt-6 mb-3">
              {cleanText}
            </h3>
          );
        }
        if (block.startsWith('**') && block.endsWith('**')) {
          return (
            <p key={index} className="font-semibold text-foreground my-2">
              {block.replace(/\*\*/g, '')}
            </p>
          );
        }
        if (block.startsWith('---')) {
          return <hr key={index} className="my-8 border-border" />;
        }
        if (block.startsWith('- ')) {
          const items = block.split('\n').filter(line => line.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside text-muted-foreground my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        if (block.match(/^\d+\./)) {
          const items = block.split('\n').filter(line => line.match(/^\d+\./));
          return (
            <ol key={index} className="list-decimal list-inside text-muted-foreground my-4 space-y-2">
              {items.map((item, i) => {
                const linkMatch = item.match(/\[(.+?)\]\((.+?)\)/);
                if (linkMatch) {
                  const [, text, href] = linkMatch;
                  return (
                    <li key={i}>
                      <a href={href} className="text-primary hover:underline">{text}</a>
                    </li>
                  );
                }
                return <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>;
              })}
            </ol>
          );
        }
        return (
          <p key={index} className="text-muted-foreground my-4 leading-relaxed">
            {block}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated: December 2024
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-xl border border-border p-8 md:p-12">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/3 mt-8" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : content ? (
                <div className="prose prose-lg max-w-none">
                  {renderContent(content)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Content not available.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
