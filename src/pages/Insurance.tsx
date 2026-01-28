import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function Insurance() {
    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-secondary/10" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
                            Insurance <span className="text-red-600">Information</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                            Protecting the Brotherhood. Real coverage for real operators and renters.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* For Operators */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-500 font-bold uppercase tracking-widest text-xs">
                                    <Shield className="h-4 w-4" /> For Operators
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight font-display">
                                    Protect Your <span className="text-blue-500">Fleet</span>
                                </h2>
                                <div className="space-y-6">
                                    <Card className="p-6 bg-white/5 border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-2">Required Coverage</h3>
                                        <p className="text-gray-400">All operators must maintain active commercial liability insurance. We verify this during the onboarding process to ensure every rig in the network is backed by professional protection.</p>
                                    </Card>
                                    <Card className="p-6 bg-white/5 border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-2">Damage Protection</h3>
                                        <p className="text-gray-400">Operators are encouraged to require a damage deposit or offer supplemental damage waivers to protect their assets from wear, tear, or incidentals during a haul.</p>
                                    </Card>
                                </div>
                            </div>

                            {/* For Renters */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 font-bold uppercase tracking-widest text-xs">
                                    <Shield className="h-4 w-4" /> For Renters
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight font-display">
                                    Peace of <span className="text-red-500">Mind</span>
                                </h2>
                                <div className="space-y-6">
                                    <Card className="p-6 bg-white/5 border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-2">Renter Liability</h3>
                                        <p className="text-gray-400">When you hook up, you're responsible for the rig. We recommend verifying with your auto insurance provider if your current policy covers towed trailers.</p>
                                    </Card>
                                    <Card className="p-6 bg-white/5 border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-2">Operator Verified</h3>
                                        <p className="text-gray-400">By renting through Patriot Hauls, you're choosing verified operators who maintain their own professional standards and insurance compliance.</p>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-20 p-8 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Info className="h-6 w-6 text-amber-500" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-display">Transparency Notice</h3>
                            </div>
                            <p className="text-gray-400 leading-relaxed italic">
                                "Patriot Hauls is a directory and platform that connects equipment owners with renters. We do not provide insurance directly. It is the responsibility of the operator and the renter to ensure they have adequate coverage for their specific hauling needs and local regulations."
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
