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
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Local Rental Directory
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connecting customers with trusted local rental businesses since 2024
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are dedicated to connecting customers with the best local rental businesses in their area. 
                Our platform makes it easy to discover, compare, and contact rental providers for all your needs—from 
                trailers and RVs to equipment and party supplies.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="leading-relaxed">
                  Founded with a vision to simplify the rental discovery process, Local Rental Directory 
                  has grown to become a trusted resource for both customers seeking rental services and 
                  businesses looking to expand their reach.
                </p>
                <p className="leading-relaxed mt-4">
                  We noticed that finding reliable local rental businesses was often difficult—searching 
                  through outdated directories, making countless phone calls, and hoping for the best. 
                  We built this platform to change that experience entirely.
                </p>
                <p className="leading-relaxed mt-4">
                  Today, we help thousands of customers find the perfect rental business for their needs, 
                  while empowering local businesses to grow their customer base through our comprehensive 
                  directory and marketing tools.
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
