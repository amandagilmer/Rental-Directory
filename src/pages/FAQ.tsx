import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (data && !error) {
        setFaqs(data);
      }
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  // Get unique categories
  const categories = [...new Set(faqs.map(faq => faq.category))];
  
  // Filter FAQs by active category
  const filteredFaqs = activeCategory 
    ? faqs.filter(faq => faq.category === activeCategory)
    : faqs;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our rental directory platform.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Category Filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All
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
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ Accordion */}
              {!loading && filteredFaqs.length > 0 && (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border border-border rounded-lg px-6 data-[state=open]:bg-card"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {/* Empty State */}
              {!loading && filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No FAQs available yet.</p>
                </div>
              )}

              {/* Contact CTA */}
              <div className="mt-12 text-center p-8 bg-card rounded-xl border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? We're here to help.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
