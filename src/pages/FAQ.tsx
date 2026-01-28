import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Truck, User } from "lucide-react";

export default function FAQ() {
  const categories = [
    {
      icon: User,
      title: "For Renters",
      faqs: [
        {
          q: "What is Patriot Hauls?",
          a: (
            <div className="space-y-4">
              <p>We're a brotherhood of trailer rental operators who got tired of going it alone. Instead of competing against each other while corporate America eats our lunch, we banded together. One brand. One standard. One brotherhood.</p>
              <p>Every operator in this directory has been vetted. They carry insurance. They signed the pledge. And if they don't hold up their end? They're out. Simple as that.</p>
            </div>
          )
        },
        {
          q: "How is this different from renting from the big corporate guys?",
          a: (
            <div className="space-y-6">
              <p>Three things:</p>
              <div className="space-y-4 pl-4 border-l-2 border-red-600">
                <p><span className="text-white font-bold uppercase">1. You're dealing with the owner, not an employee.</span> They answer their own phone. They have a name and a reputation to protect.</p>
                <p><span className="text-white font-bold uppercase">2. Your money stays local.</span> It feeds families in your community, not shareholders in some corporate tower.</p>
                <p><span className="text-white font-bold uppercase">3. The equipment is actually maintained.</span> These operators take pride in their rigs. No rust buckets. No "it'll probably make it."</p>
              </div>
            </div>
          )
        },
        {
          q: "How do I rent a trailer?",
          a: "Search for trailers in your area, find an operator you like, and contact them directly. You'll work with the actual business owner to set up your rental. No corporate call centers. No runaround."
        },
        {
          q: "What do the badges mean?",
          a: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-yellow-500 font-bold block mb-1">Founding Member</span>
                  One of the originals. They were here building this from Day One.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-blue-500 font-bold block mb-1">Verified Operator</span>
                  We've checked them out. They're legit.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-red-500 font-bold block mb-1">Veteran Owned</span>
                  This business is owned and operated by a U.S. military veteran. We thank them for their service.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-green-500 font-bold block mb-1">Insured & Bonded</span>
                  They carry active business insurance. Certificate on file.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-purple-500 font-bold block mb-1">Top Rated</span>
                  4.5+ stars with real reviews from real customers.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-amber-600 font-bold block mb-1">Elite Operator</span>
                  The best of the best. Achieved Top Rated status through long-term excellence and high mission volume.
                </div>
              </div>
            </div>
          )
        },
        {
          q: "Am I covered by your insurance?",
          a: (
            <div className="space-y-4">
              <p className="text-white font-bold italic underline decoration-red-600 underline-offset-4 uppercase">No. And we're going to be straight with you about that.</p>
              <p>Our operators carry business liability insurance to protect their operations. That's what responsible business owners do. But that coverage doesn't extend to you as the renter.</p>
              <p>When you sign a rental agreement, you're taking responsibility for that trailer while it's in your hands. That means:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your vehicle insurance may cover the trailer while towing — check with your provider</li>
                <li>You're responsible for any damage that happens on your watch</li>
                <li>Your negligence = your liability</li>
              </ul>
              <p>Some operators offer supplemental coverage you can purchase. Ask them about it. But don't assume you're covered just because you rented from an insured operator.</p>
              <p className="text-red-500 font-bold uppercase tracking-tight italic">We're not trying to scare you — we're keeping it real. Know what you're signing before you hitch up.</p>
            </div>
          )
        },
        {
          q: "What if I have a problem?",
          a: (
            <div className="space-y-4">
              <p>Contact the operator directly first. They're business owners who care about their reputation — they'll want to make it right. If you can't reach a resolution, email us at support@patriothauls.com and we'll help sort it out.</p>
              <p className="font-bold text-white italic uppercase">Operators who consistently screw people over don't stay in our network.</p>
            </div>
          )
        }
      ]
    },
    {
      icon: Truck,
      title: "For Operators",
      faqs: [
        {
          q: "How do I get my business listed?",
          a: "Apply through our \"Join the Brotherhood\" page. You'll need your business info, proof of insurance, and you'll need to sign the pledge. We review every application — this isn't a free-for-all directory where anybody can list."
        },
        {
          q: "What are the requirements?",
          a: (
            <ul className="list-disc pl-6 space-y-2">
              <li>Active trailer rental business — not equipment sitting in a field</li>
              <li>Valid business liability insurance (minimum $500K)</li>
              <li>Professional-grade equipment that's actually maintained</li>
              <li>Signed commitment to the Patriot Hauls Pledge</li>
              <li>Values that align with our brotherhood</li>
            </ul>
          )
        },
        {
          q: "Why do you require insurance?",
          a: (
            <div className="space-y-4">
              <p className="font-bold text-white italic uppercase underline decoration-blue-600 underline-offset-4">Because we're not a sketchy peer-to-peer marketplace.</p>
              <p>You know what's out there. Some guy with a rusted-out trailer in his backyard, no license, no insurance, cash only. He'll rent you a rig that hasn't been inspected since 2008 and disappear the second something goes wrong.</p>
              <p><span className="text-white font-black">That's not us. That will never be us.</span></p>
              <p>Insurance means skin in the game. It means you cared enough to do things right. It means you're going to be there tomorrow — not ghost somebody when the wheels fall off.</p>
              <p className="text-red-500 font-bold uppercase tracking-tighter">We're raising the standard. That's the whole point.</p>
            </div>
          )
        },
        {
          q: "What's the 60-day probation?",
          a: "New operators start on probation. We watch for complaints, response times, and whether you actually hold up your end of the pledge. Pass probation, you get full status and all your earned badges. Don't pass? You're out."
        },
        {
          q: "What's in it for me?",
          a: (
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-white font-bold">Customers who are looking for you</span> — not tire-kickers, people who want patriot-owned businesses</li>
              <li><span className="text-white font-bold">Credibility</span> — you're part of a vetted network, not some random listing</li>
              <li><span className="text-white font-bold">A brotherhood that has your back</span> — intel sharing, support, protection</li>
              <li><span className="text-white font-bold">Higher business value</span> — being part of a recognized brand increases what your business is worth</li>
              <li><span className="text-white font-bold">Marketing resources</span> — templates, brand assets, promotional materials</li>
            </ul>
          )
        }
      ]
    },
    {
      icon: Shield,
      title: "General",
      faqs: [
        {
          q: "How do I get in touch?",
          a: "Email support@patriothauls.com for general questions. operators@patriothauls.com if you want to join. For rental questions, contact the operator directly — they'll get you sorted faster than we can."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden border-b border-white/5 text-center">
          <div className="absolute inset-0 bg-secondary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              General <span className="text-red-600">Intel</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium italic underline decoration-blue-600/30 underline-offset-8">
              "You've got questions. We've got direct answers. No corporate fluff."
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {categories.map((cat, i) => (
              <div key={i} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                    <cat.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tight font-display">
                    {cat.title}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {cat.faqs.map((faq, j) => (
                    <AccordionItem
                      key={j}
                      value={`item-${i}-${j}`}
                      className="border border-white/10 rounded-xl px-6 bg-white/5 overflow-hidden transition-all duration-300 hover:border-red-600/30"
                    >
                      <AccordionTrigger className="text-left font-bold text-white hover:no-underline py-6 uppercase tracking-tight italic">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400 text-lg leading-relaxed pb-6">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Still Need Support Section */}
        <section className="py-20 bg-white/5 border-t border-white/10 text-center">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter font-display mb-6">
              Still Need <span className="text-red-600">Mission Support?</span>
            </h3>
            <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg font-medium">
              Can't find what you need? Reach out to our dispatch team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-10 py-5 text-lg font-bold text-white uppercase tracking-widest hover:bg-red-700 transition-colors shadow-xl shadow-red-600/20"
              >
                Mission Support
              </a>
              <a
                href="mailto:support@patriothauls.com"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-10 py-5 text-lg font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
