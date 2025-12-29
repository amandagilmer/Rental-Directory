import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Users, MapPin, Shield } from "lucide-react";

const valueProps = [
  {
    icon: Shield,
    title: "Verified Businesses",
    description: "Every listing on our platform is verified to ensure you connect with legitimate, quality rental providers."
  },
  {
    icon: MapPin,
    title: "Local Focus",
    description: "We specialize in connecting you with businesses in your local community, supporting local economies."
  },
  {
    icon: Users,
    title: "Trusted Reviews",
    description: "Real customer reviews help you make informed decisions about which rental business to choose."
  },
  {
    icon: CheckCircle,
    title: "Easy Discovery",
    description: "Our powerful search and filtering tools help you find exactly what you need, when you need it."
  }
];

export default function About() {
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', 'about')
        .maybeSingle();
      
      setPageContent(data?.content || null);
      setLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6 uppercase tracking-wide">
              About Patriot Hauls
            </h1>
            <p className="text-xl text-secondary-foreground/80 max-w-2xl mx-auto">
              Hauling the Heart of America since 2024
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 uppercase">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are dedicated to supporting American workers and businesses by connecting them with the 
                equipment they need to get the job done. From flatbeds to dump trailers, our platform makes 
                it easy to find trusted local rental providers who understand hard work.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 text-center uppercase">Our Story</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="leading-relaxed">
                  Patriot Hauls was founded by blue-collar Americans who saw a need: hardworking people 
                  struggling to find reliable trailer rentals in their area. Too many hours wasted on 
                  phone calls, driving around, and dealing with unreliable providers.
                </p>
                <p className="leading-relaxed mt-4">
                  We built this platform to change that. By connecting operators with customers who need 
                  their equipment, we're supporting the backbone of American infrastructure—the workers 
                  who build, haul, and move our nation forward.
                </p>
                <p className="leading-relaxed mt-4">
                  Today, Patriot Hauls serves operators and renters across the country, helping local 
                  businesses thrive while making it easy for customers to find exactly what they need.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valueProps.map((prop) => (
                <div key={prop.title} className="text-center p-6 rounded-xl bg-card border border-border">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                    <prop.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground text-sm">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-primary-foreground/80 text-sm">We believe in honest, clear information</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Quality</h3>
                <p className="text-primary-foreground/80 text-sm">We maintain high standards for listed businesses</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-primary-foreground/80 text-sm">We support local businesses and communities</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Innovation</h3>
                <p className="text-primary-foreground/80 text-sm">We continuously improve our platform</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
