import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  category: string | null;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (data && !error) {
        setPost(data);
        
        // Fetch related posts from same category
        if (data.category) {
          const { data: related } = await supabase
            .from('blog_posts')
            .select('id, title, slug, featured_image, category')
            .eq('is_published', true)
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);
          
          if (related) {
            setRelatedPosts(related);
          }
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  // Simple markdown to HTML conversion
  const renderContent = (markdown: string) => {
    return markdown.split('\n\n').map((block, index) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
            {block.replace('## ', '')}
          </h2>
        );
      }
      if (block.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
            {block.replace('### ', '')}
          </h3>
        );
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside text-muted-foreground my-4 space-y-2 ml-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      if (block.match(/^\d+\./)) {
        const items = block.split('\n').filter(line => line.match(/^\d+\./));
        return (
          <ol key={index} className="list-decimal list-inside text-muted-foreground my-4 space-y-2 ml-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        );
      }
      // Handle bold text and links
      let text = block;
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
      
      return (
        <p
          key={index}
          className="text-muted-foreground my-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-6 w-48 mb-8" />
              <Skeleton className="h-64 w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Article Header */}
        <article>
          <header className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-accent/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Link>
                
                {post.category && (
                  <Badge variant="secondary" className="mb-4">
                    {post.category}
                  </Badge>
                )}
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {post.author_name && (
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author_name}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="container mx-auto px-4 -mt-8 mb-12">
              <div className="max-w-4xl mx-auto">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full rounded-xl shadow-lg object-cover aspect-video"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="prose prose-lg max-w-none">
                  {renderContent(post.content)}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 md:py-16 bg-card border-t border-border">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Related Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="bg-background rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-video bg-muted">
                      {relatedPost.featured_image ? (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <span className="text-2xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
