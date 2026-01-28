import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Shield, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function JoinBrotherhood() {
    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-blue-900/20" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-5xl md:text-8xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
                            Join the <span className="text-red-600">Brotherhood</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium mb-10">
                            Stop letting your rigs sit idle. List your fleet on the most authentic, grit-filled marketplace in America.
                        </p>
                        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 h-16 px-12 text-xl font-bold uppercase tracking-wider shadow-2xl shadow-red-600/40 antialiased">
                            <Link to="/auth?mode=signup">Apply to Join</Link>
                        </Button>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-white/5 border-y border-white/10">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: Users,
                                    title: "Elite Network",
                                    description: "Join a community of like-minded operators who value quality and service."
                                },
                                {
                                    icon: Shield,
                                    title: "Verified Trust",
                                    description: "Earn badges that prove you're an elite professional in the hauling space."
                                },
                                {
                                    icon: Rocket,
                                    title: "High Octane Growth",
                                    description: "Get more eyes on your gear and more qualified leads in your inbox."
                                },
                                {
                                    icon: Trophy,
                                    title: "Blue-Collar Built",
                                    description: "Built by workers, for workers. No corporate BS, just real results."
                                }
                            ].map((benefit, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                                        <benefit.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white uppercase italic font-display tracking-tight">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* The Process */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-display mb-16 text-center">
                                The <span className="text-red-600">Onboarding</span> Protocol
                            </h2>

                            <div className="relative space-y-12">
                                <div className="absolute left-6 top-8 bottom-8 w-px bg-white/10 hidden md:block" />

                                {[
                                    {
                                        step: "01",
                                        title: "Submit intel",
                                        description: "Fill out your application and provide details about your fleet and business."
                                    },
                                    {
                                        step: "02",
                                        title: "Pass Vetting",
                                        description: "Our team verifies your identity and insurance to maintain platform integrity."
                                    },
                                    {
                                        step: "03",
                                        title: "Deploy Fleet",
                                        description: "List your assets with professional photos and high-impact AI-generated briefings."
                                    },
                                    {
                                        step: "04",
                                        title: "Earn Badges",
                                        description: "Operate with excellence to earn tactical trust badges and elite placement."
                                    }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 items-start relative z-10">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0A0F1C] border border-red-600 flex items-center justify-center font-black text-red-600 font-display italic text-lg shadow-lg shadow-red-600/10">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2 uppercase italic font-display">
                                                {step.title}
                                            </h3>
                                            <p className="text-lg text-gray-400">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-gradient-to-t from-blue-900/10 to-[#0A0F1C] border-t border-white/10">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter font-display mb-8">
                            Answer the <span className="text-red-600">Call</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Don't settle for mediocre marketplaces. Join the one built for Americans who get things done.
                        </p>
                        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 h-16 px-12 text-xl font-bold uppercase tracking-wider shadow-2xl shadow-red-600/40 antialiased">
                            <Link to="/auth?mode=signup">Join the Network</Link>
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
