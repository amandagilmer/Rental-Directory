import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Hammer, Users, Heart, Scale, Flag, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="relative py-24 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-blue-900/10 opacity-50" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-5xl md:text-8xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              About <span className="text-red-600">Us</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-gray-300 italic tracking-tight uppercase max-w-4xl mx-auto">
              "We're not corporate America. We're the blue collars who built it."
            </p>
          </div>
        </section>

        {/* What We're About */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8 text-center mb-16">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display">
                What We're <span className="text-red-600">About</span>
              </h2>
              <div className="h-1.5 w-24 bg-red-600 mx-auto -skew-x-12" />
            </div>

            <div className="space-y-8 text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
              <p>
                This isn't a franchise. This isn't some corporate play. This is a <span className="text-white font-black italic">brotherhood</span> — a network of vetted, insured, patriot-owned businesses who believe in quality equipment, honest service, and taking care of our neighbors.
              </p>
              <p>
                Every operator in our network has been checked out. They carry insurance. They signed the pledge. <span className="text-red-500 font-bold italic">They've got skin in the game.</span>
              </p>
              <p className="text-gray-400">
                We're not some sketchy peer-to-peer deal where you Venmo a stranger and hope for the best. We're professionals who do this right.
              </p>
            </div>
          </div>
        </section>

        {/* Where Your Money Goes Section */}
        <section className="py-24 bg-white/5 border-y border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/5" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display">
                  Where Your <span className="text-red-600">Money Goes</span>
                </h2>
                <div className="space-y-6 text-xl text-gray-300">
                  <p>
                    When you rent from the big corporate guys, your money disappears into some tower you'll never see. Shareholders. Executives. People who've never hitched a trailer in their lives.
                  </p>
                  <p className="font-bold text-white italic text-2xl">
                    When you rent from us? <span className="text-red-600 font-black underline decoration-4 underline-offset-8">That money feeds a family down the road.</span>
                  </p>
                  <p className="text-gray-400 italic">
                    It pays for Little League uniforms and truck payments and keeping the lights on in a shop somebody built with their own two hands.
                  </p>
                  <p className="text-white font-black uppercase tracking-tight text-3xl">
                    We're not a line item on somebody's earnings call. <span className="text-blue-500">We're your neighbors.</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-8 bg-blue-900/10 border-blue-900/20 backdrop-blur-sm">
                  <Users className="h-12 w-12 text-blue-500 mb-6" />
                  <h3 className="text-2xl font-black text-white uppercase italic font-display tracking-tight mb-4">Community Fuel</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    By choosing Patriot Hauls, you are directly investing in local families and businesses, not corporate overhead.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter font-display">
                What Makes Us <span className="text-red-600">Different</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Every Operator is Vetted",
                  description: "We don't let just anybody in. Every operator carries insurance, runs a legitimate business, and has signed our pledge. If they can't meet the standard, they're not in the brotherhood. Simple as that."
                },
                {
                  icon: Hammer,
                  title: "Equipment That's Maintained",
                  description: "Our operators don't rent out rust buckets. They maintain heavy-duty, professional-grade trailers built for real work. When you show up to get that rig, it's ready to roll — not a prayer and a hope."
                },
                {
                  icon: Users,
                  title: "You Know Who You're Dealing With",
                  description: "When you rent from corporate, you're a number. When you rent from us, you know the owner's name. You have their phone number. They live in your community. That's accountability you can't fake."
                }
              ].map((item, i) => (
                <Card key={i} className="p-8 bg-white/5 border-white/10 hover:bg-white/10 transition-all flex flex-col group">
                  <div className="p-4 rounded-xl bg-red-600/10 border border-red-600/20 w-fit mb-6 group-hover:bg-red-600/20 transition-colors">
                    <item.icon className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase italic font-display tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-10 rounded-3xl bg-red-600 shadow-2xl shadow-red-600/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                <Shield className="h-40 w-40" />
              </div>
              <div className="relative z-10 max-w-3xl">
                <h3 className="text-3xl font-black uppercase italic font-display tracking-tight mb-4 flex items-center gap-3">
                  <Flag className="h-8 w-8" /> We Protect Our Own
                </h3>
                <p className="text-xl md:text-2xl font-bold leading-tight italic">
                  "You steal from one of us, you just made enemies with all of us. We share intel. We watch out for each other. Your name gets passed around faster than you can unhitch that trailer."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Code Section */}
        <section className="py-24 bg-[#0A0F1C] border-y border-white/10">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display mb-4">
                The Code We <span className="text-red-600">Live By</span>
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Rules of the Road</p>
            </div>

            <div className="space-y-8">
              {[
                { title: "Brotherhood before profit.", detail: "When one of us wins, we all win. When one needs help, we show up." },
                { title: "Your word is your bond.", detail: "We say what we mean and we do what we say." },
                { title: "Take care of your people.", detail: "Customers. Brotherhood. Community." },
                { title: "No shortcuts.", detail: "Do it right or don't do it." },
                { title: "Zero tolerance for scammers.", detail: "Bad actors don't last here." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-red-600/30 transition-all shadow-lg hover:shadow-red-600/5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-black text-white italic text-lg shadow-lg shadow-red-600/20">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase italic font-display tracking-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-lg text-gray-400 font-medium">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Bottom Line */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter font-display mb-8">
              The Bottom <span className="text-red-600">Line</span>
            </h2>
            <div className="space-y-8 mb-16">
              <p className="text-2xl md:text-3xl text-gray-300 font-bold italic leading-tight">
                "We're not part of corporate America — <br />
                <span className="text-white font-black underline decoration-blue-600 underline-offset-8 text-3xl md:text-4xl block mt-4">WE ARE AMERICA."</span>
              </p>
              <p className="text-xl text-gray-400 leading-relaxed font-medium">
                Working-class. Veteran-strong. Built by the people who actually do the work.
              </p>
              <p className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter font-display">
                If you're with us, you're <span className="text-red-600">family.</span>
              </p>
              <p className="text-3xl font-display font-black text-white uppercase tracking-tighter opacity-80 italic">
                Welcome to Patriot Hauls.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 h-16 px-10 text-xl font-bold uppercase tracking-wider shadow-2xl shadow-red-600/40 antialiased group">
                <Link to="/">
                  <Flag className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Find Local Trailers
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-zinc-100 h-16 px-10 text-xl font-black uppercase tracking-wider antialiased shadow-xl">
                <Link to="/join">
                  <Users className="mr-3 h-6 w-6" />
                  Join the Brotherhood
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
