import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, Hammer, Users } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden border-b border-white/5 text-center">
          <div className="absolute inset-0 bg-red-900/5" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              The <span className="text-red-600">Standard</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Rules of engagement for the Patriot Hauls platform. Built on accountability and respect.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollArea className="h-[600px] rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
              <div className="space-y-12 text-gray-300">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Platform Role</h2>
                  </div>
                  <p className="leading-relaxed">
                    Patriot Hauls is a directory and marketplace. We facilitate the connection between equipment owners (Operators) and users (Renters). We do not own the equipment and are not a party to the rental agreement between the Operator and the Renter.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hammer className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Operator Standards</h2>
                  </div>
                  <p className="leading-relaxed">
                    Operators agree to maintain their rigs to professional safety standards. Misrepresentation of equipment, failure to honor bookings, or substandard behavior will result in immediate removal from the network.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white uppercase italic font-display">Renter Liability</h2>
                  </div>
                  <p className="leading-relaxed">
                    By booking through Patriot Hauls, Renters agree to follow all safety guidelines provided by the Operator. Renters are fully responsible for any damage to the equipment or third parties during the rental period.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white uppercase italic font-display">Payments & Refunds</h2>
                  <p className="leading-relaxed">
                    All transactions must occur through the Patriot Hauls secure payment system. Circumventing the platform to avoid fees is a violation of the Brotherhood and will lead to termination of your account.
                  </p>
                </section>

                <p className="italic text-sm text-gray-500 pt-8 border-t border-white/5">
                  Last Updated: January 2026. By using this platform, you agree to these standards. If you can't honor them, don't use the site.
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
