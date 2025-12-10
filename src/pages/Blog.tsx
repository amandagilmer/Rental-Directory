import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, author_name, category, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (data && !error) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
  const filteredPosts = activeCategory
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Blog & Resources
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tips, guides, and insights for rental businesses and customers
            </p>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 justify-center">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  All Posts
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blog Posts Grid */}
            {!loading && filteredPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-6">
                      {post.category && (
                        <Badge variant="secondary" className="mb-3">
                          {post.category}
                        </Badge>
                      )}
                      <Link to={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {post.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.author_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No blog posts yet
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for helpful articles and guides.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
