import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden border-b border-white/5 text-center">
          <div className="absolute inset-0 bg-secondary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              Privacy <span className="text-red-600">Protocol</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              We protect your intel like we protect our own gear. No selling data, no corporate games.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollArea className="h-[600px] rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
              <div className="space-y-12 text-gray-300">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Data Collection</h2>
                  </div>
                  <p className="leading-relaxed">
                    We collect only what is necessary to operate the platform and maintain the Brotherhood's integrity. This includes your name, contact info, business credentials, and fleet details.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Tactical Documentation</h2>
                  </div>
                  <p className="leading-relaxed">
                    For our veteran operators, we may handle sensitive documents like the DD-214 for verification. These documents are processed through secure, encrypted channels and are never stored longer than necessary for verification purposes. Your service is respected here.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Security Standards</h2>
                  </div>
                  <p className="leading-relaxed">
                    We use industry-standard encryption for all transmissions. Your financial data is handled by secure, PCI-compliant processors (Stripe). We don't see your card numbers, and we never will.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white uppercase italic font-display">Intel Sharing</h2>
                  <p className="leading-relaxed">
                    We only share your information with the direct parties involved in a rental transaction (Operator and Renter). We will never sell your data to third-party marketing firms. That's not how we do business.
                  </p>
                </section>

                <p className="italic text-sm text-gray-500 pt-8 border-t border-white/5">
                  Last Updated: January 2026. This policy is subject to change as our mission evolves. Any significant changes will be communicated directly to the Brotherhood.
                </p>
              </div>
            </ScrollArea>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
