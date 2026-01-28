import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Phone,
    HardHat,
    Users,
    Flag,
    Handshake,
    Gavel,
    Truck,
    Star,
    Search,
    Hammer,
    MessageSquare,
    Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { StaticBadge } from "@/components/BadgeDisplay";

const standards = [
    {
        icon: Search,
        title: "Verify",
        description: "Every operator undergoes a rigorous identity and business verification process. We know exactly who is behind every trailer.",
        badge: "PATRIOT VERIFIED"
    },
    {
        icon: Hammer,
        title: "Inspect",
        description: "Gear must be maintained to professional standards. Safety isn't optional; it's the foundation of every haul.",
        badge: "INSPECTED GEAR"
    },
    {
        icon: ShieldCheck,
        title: "Support",
        description: "24/7 assistance for both renters and operators. We've got your back, no matter where the road takes you.",
        badge: "24/7 SUPPORT"
    },
    {
        icon: MessageSquare,
        title: "Respond",
        description: "Operators are committed to clear, honest, and timely communication. No ghosting, no games, just business.",
        badge: "RESPONSIVE OWNER"
    },
    {
        icon: Heart,
        title: "Respect",
        description: "A community built on mutual respect and shared values. We treat every piece of equipment and every customer with the honor they deserve.",
        badge: "RESPECTED COMMUNITY"
    }
];

export default function ThePledge() {
    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col font-sans antialiased">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-blue-900/10 opacity-50" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-5xl md:text-8xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
                            The <span className="text-red-600">Pledge</span>
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold text-gray-300 italic tracking-tight uppercase max-w-4xl mx-auto leading-tight">
                            "This is the word every operator in our network has given."
                        </p>
                    </div>
                </section>

                {/* Intro Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="space-y-8 text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                            <p>
                                Being part of Patriot Hauls isn't about paying a fee and getting a listing. It's about joining <span className="text-white font-black italic">a brotherhood</span> that holds itself to a higher standard.
                            </p>
                            <p>
                                Every operator in our directory has read this pledge, agreed to it, and put their name on it. <span className="text-red-500 font-black italic underline decoration-red-600/30 underline-offset-8">It's not marketing fluff — it's a commitment.</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* The Core Pledge */}
                <section className="py-24 bg-white/5 border-y border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-900/5" />
                    <div className="container mx-auto px-4 max-w-4xl relative z-10">
                        <div className="p-10 md:p-16 rounded-[2.5rem] bg-black/60 border-2 border-red-600/20 shadow-2xl shadow-red-600/5 relative group hover:border-red-600/40 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <ShieldCheck className="h-64 w-64 text-red-600" />
                            </div>

                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display mb-12 flex items-center gap-4">
                                <Star className="h-10 w-10 text-red-600 fill-red-600" /> The Pledge
                            </h2>

                            <div className="space-y-8 text-2xl md:text-4xl font-bold text-gray-100 italic tracking-tight leading-[1.15]">
                                <p className="text-red-500 not-italic font-black text-4xl mb-12 uppercase tracking-tighter border-l-8 border-red-600 pl-8">"As a Patriot Hauls operator:</p>
                                <p className="pl-8">I don't cut corners. I don't make excuses.</p>
                                <p className="pl-8">When I shake your hand, that's my word — and my word <span className="text-red-600 underline">means something.</span></p>
                                <p className="pl-8">My equipment shows up ready to work. I answer my phone. I treat you the way I'd want to be treated if I was the one who needed a rig.</p>
                                <p className="pl-8">I carry insurance because that's what professionals do.</p>
                                <p className="pl-8">I've got my brotherhood's back, and they've got mine.</p>
                                <p className="text-red-600 font-black text-5xl mt-12 uppercase tracking-tighter text-right">That's the deal."</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Original Standards Grid (User Liked) */}
                <section className="py-24 bg-black/20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter font-display mb-4">
                                The 5-Point <span className="text-red-600">Standard</span>
                            </h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Professional Grade Excellence</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {standards.map((standard, index) => (
                                <Card key={index} className="p-8 bg-white/5 border-white/10 hover:bg-white/10 hover:translate-y-[-4px] transition-all group flex flex-col items-center text-center">
                                    <div className="mb-6 p-4 rounded-2xl bg-red-600/10 border border-red-600/20 group-hover:bg-red-600/20 transition-colors">
                                        <standard.icon className="h-10 w-10 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 uppercase italic font-display tracking-tight">
                                        {standard.title}
                                    </h3>
                                    <p className="text-gray-400 mb-8 leading-relaxed font-medium">
                                        {standard.description}
                                    </p>
                                    <div className="mt-auto">
                                        <StaticBadge badgeKey={standard.badge.toLowerCase().replace(/ /g, '_')} size="sm" showLabel />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What This Means For You */}
                <section className="py-24 border-y border-white/5">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter font-display mb-8">
                                    What This <span className="text-red-600">Means For You</span>
                                </h2>
                                <div className="space-y-8 text-xl text-gray-400">
                                    <p className="text-white font-bold italic text-2xl leading-snug">
                                        When you rent from a Patriot Hauls operator, you're not gambling on some random stranger from the internet.
                                    </p>
                                    <ul className="space-y-6">
                                        {[
                                            "Made a public commitment to doing things right",
                                            "Been vetted by our network — not just anybody gets in",
                                            "Insurance on file because fly-by-night isn't how we operate",
                                            "Accountability to the whole brotherhood — not just themselves",
                                            "A reputation to protect — their name is on the line"
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-start gap-4 text-gray-200 font-semibold group">
                                                <div className="mt-1.5 p-1 rounded-full bg-red-600 group-hover:scale-110 transition-transform">
                                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                                </div>
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute -inset-10 bg-red-600/10 rounded-full blur-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-700" />

                                <Card className="relative p-12 bg-white/5 border-white/10 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Handshake className="h-32 w-32 text-blue-500" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 w-fit">
                                            <ShieldCheck className="h-10 w-10 text-blue-500" />
                                        </div>
                                        <h4 className="text-3xl font-black text-white uppercase italic font-display tracking-tight leading-none">The Brotherhood Advantage</h4>
                                        <p className="text-gray-400 text-xl leading-relaxed italic">
                                            "We've removed the risk so you can focus on the job. No broken rigs, no missing owners, no corporate hoops."
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Difference Table */}
                <section className="py-24 bg-white/5 border-b border-white/10">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter font-display mb-4">
                                The <span className="text-red-600">Difference</span>
                            </h2>
                            <p className="text-xl text-gray-400 font-bold uppercase tracking-widest italic">Know what you're getting.</p>
                        </div>

                        <div className="max-w-5xl mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl shadow-black/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 bg-white/5 border-b border-white/10">
                                <div className="p-8 hidden md:block" />
                                <div className="p-8 text-center border-x border-white/10 bg-zinc-900/30">
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-2">The Other Guys</p>
                                    <h3 className="text-2xl font-black text-zinc-500 uppercase italic font-display">Fly-By-Night</h3>
                                </div>
                                <div className="p-8 text-center bg-red-600/20 px-12 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
                                    <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-2 relative z-10">The Elite</p>
                                    <h3 className="text-2xl font-black text-white uppercase italic font-display relative z-10">Patriot Hauls Operator</h3>
                                </div>
                            </div>

                            {[
                                { label: "Insurance", other: '"I don\'t need that"', standard: "Required. Verified. On file.", icon: ShieldCheck },
                                { label: "Business", other: "Side hustle, cash only", standard: "Legitimate operation", icon: HardHat },
                                { label: "Equipment", other: '"It\'ll probably make it"', standard: "Maintained. Inspected. Ready.", icon: Truck },
                                { label: "Accountability", other: "Ghosts you when it breaks", standard: "Answers the phone. Stands behind their word.", icon: Phone },
                                { label: "When It Goes Wrong", other: "Good luck finding them", standard: "You know exactly who to call", icon: AlertTriangle },
                                { label: "Reputation", other: "Doesn't care — on to the next mark", standard: "Their name is on the line", icon: Flag }
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/10 transition-colors group">
                                    <div className="p-6 md:p-10 flex items-center gap-5 bg-white/5 md:bg-transparent">
                                        <row.icon className="h-7 w-7 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform shadow-md" />
                                        <span className="text-white font-black uppercase italic tracking-tight font-display text-xl">{row.label}</span>
                                    </div>
                                    <div className="p-6 md:p-10 text-zinc-500 font-bold italic md:text-center flex items-center md:justify-center border-x border-white/5">
                                        <span className="md:hidden text-gray-700 mr-2 not-italic font-black text-sm uppercase">Fly-By-Night: </span>
                                        "{row.other}"
                                    </div>
                                    <div className="p-6 md:p-10 text-white font-black md:text-center flex items-center md:justify-center bg-red-600/5 group-hover:bg-red-600/10 transition-colors">
                                        <span className="md:hidden text-red-600 mr-2 font-black text-sm uppercase">Operator: </span>
                                        {row.standard}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter font-display leading-[1.1] max-w-3xl mx-auto">
                                "We're not a sketchy peer-to-peer deal. We're the brotherhood that <span className="text-red-600 underline decoration-red-600/40 underline-offset-8">actually gives a damn.</span>"
                            </p>
                        </div>
                    </div>
                </section>

                {/* Accountability Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter font-display mb-10">
                            We Hold Each <span className="text-red-600">Other Accountable</span>
                        </h2>
                        <div className="space-y-10 text-2xl md:text-3xl text-gray-300 font-bold italic leading-snug tracking-tight">
                            <p>
                                The pledge isn't just words on a wall. Operators who don't hold up their end face consequences — <span className="text-white font-black not-italic underline decoration-red-600 decoration-4">probation, suspension, or removal from the network.</span>
                            </p>
                            <p className="text-xl md:text-2xl font-medium text-gray-400 not-italic">
                                We take this seriously because our reputation is built on trust. One bad operator makes all of us look bad. That's why we're selective, and that's why we don't let things slide.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-red-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    <div className="absolute -top-24 -right-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                        <div className="mb-10 inline-flex p-6 rounded-[2rem] bg-black/20 border border-white/20 shadow-2xl">
                            <Gavel className="h-14 w-14 text-white" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter font-display mb-8 leading-none">
                            Think You <span className="text-black/80">Belong Here?</span>
                        </h2>
                        <p className="text-2xl md:text-3xl font-bold text-white italic mb-12 tracking-tight leading-relaxed">
                            If you run a rental business and this sounds like the brotherhood you've been looking for — we want to hear from you.
                        </p>
                        <Button asChild size="lg" className="bg-white text-red-600 hover:bg-zinc-100 h-24 px-16 text-3xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all antialiased rounded-[2rem]">
                            <Link to="/join">
                                Apply To Join
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
