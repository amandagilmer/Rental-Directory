import { ShieldCheck, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WhyChoose = () => {
    const cards = [
        {
            title: "VERIFIED BUSINESSES",
            description: "Find trusted operators with licenses & insurance",
            icon: <ShieldCheck className="w-12 h-12 text-primary mb-4" />,
        },
        {
            title: "SUPPORT LOCAL",
            description: "Connect with family-owned businesses who get hard work",
            icon: <Users className="w-12 h-12 text-primary mb-4" />,
        },
        {
            title: "REAL REVIEWS",
            description: "See what other blue-collar workers say about local providers",
            icon: <Star className="w-12 h-12 text-primary mb-4" />,
        },
    ];

    return (
        <section className="relative py-32 overflow-hidden bg-black">
            {/* Dark Gritty Flag Background */}
            <div
                className="absolute inset-0 z-0 opacity-80"
                style={{
                    backgroundImage: 'url("/flag-bg-gritty.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            {/* Deep Dark Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black via-black/40 to-black" />

            <div className="container mx-auto px-4 relative z-20">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-display font-black text-white mb-4 uppercase tracking-tighter italic">
                        WHY CHOOSE <span className="text-red-600">PATRIOT HAULS</span>
                    </h2>
                    <p className="text-2xl text-zinc-300 font-bold uppercase tracking-widest">
                        The Directory for Hardworking Americans
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {cards.map((card, index) => (
                        <Card key={index} className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800 shadow-2xl hover:shadow-red-600/20 transition-all duration-500 flex flex-col items-center text-center p-10 h-full group">
                            <CardHeader className="flex flex-col items-center pb-4">
                                <div className="p-5 rounded-2xl bg-red-600/20 mb-4 group-hover:scale-110 transition-transform duration-500">
                                    {card.icon}
                                </div>
                                <CardTitle className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">
                                    <span className="group-hover:text-red-600 transition-colors duration-300">{card.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-300 font-medium text-lg leading-relaxed">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <div className="inline-block relative">
                        <div className="absolute -inset-8 bg-red-600/10 blur-3xl rounded-full" />
                        <p className="text-3xl text-white italic font-display font-medium max-w-4xl mx-auto relative z-10 leading-relaxed tracking-tight">
                            "We're not a marketplace—we're a <span className="text-red-600 font-bold underline decoration-red-600/30 underline-offset-8">directory</span> of real local businesses you can trust for your next job."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
