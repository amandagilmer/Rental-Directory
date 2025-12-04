import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const pricingTiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started",
    features: [
      "Basic business listing",
      "Up to 5 photos",
      "Contact info display",
      "Limited to 10 leads/month",
      "Standard support",
    ],
    cta: "Get Started",
    popular: false,
    enterprise: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For growing businesses",
    features: [
      "Everything in Free",
      "Verified badge",
      "Unlimited photos",
      "Up to 50 leads/month",
      "Priority placement in search results",
      "Analytics dashboard",
      "Email support",
    ],
    cta: "Get Started",
    popular: true,
    enterprise: false,
  },
  {
    name: "Premium",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For established businesses",
    features: [
      "Everything in Pro",
      "Featured listing placement",
      "Unlimited leads",
      "Advanced analytics with conversion tracking",
      "Phone support",
      "Custom branding",
    ],
    cta: "Get Started",
    popular: false,
    enterprise: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 249,
    annualPrice: 199,
    description: "For large organizations",
    features: [
      "Everything in Premium",
      "Multiple location support",
      "API access",
      "Dedicated account manager",
      "White-label options",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
    enterprise: true,
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the perfect plan to grow your rental business and connect with more customers.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Save 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.popular
                    ? "border-primary shadow-lg shadow-primary/10 scale-105 z-10"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    {tier.enterprise && !isAnnual ? (
                      <div className="text-4xl font-bold text-foreground">
                        $249
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-foreground">
                        ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                    )}
                    {isAnnual && tier.monthlyPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually (${tier.annualPrice * 12}/year)
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or Trust Section */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Questions? We're here to help.
          </h2>
          <p className="text-muted-foreground mb-6">
            Contact our team for personalized guidance on choosing the right plan.
          </p>
          <Button variant="outline" size="lg">
            Contact Support
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
