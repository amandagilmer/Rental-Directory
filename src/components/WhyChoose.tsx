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
        <section className="bg-muted/30 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 uppercase tracking-tight">
                        WHY CHOOSE PATRIOT HAULS
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        The Directory for Hardworking Americans
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {cards.map((card, index) => (
                        <Card key={index} className="bg-card border-none shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center p-6 h-full">
                            <CardHeader className="flex flex-col items-center pb-2">
                                {card.icon}
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground uppercase">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-lg text-foreground italic font-medium max-w-2xl mx-auto">
                        "We're not a marketplace—we're a directory of real local businesses you can trust for your next job."
                    </p>
                </div>
            </div>
        </section>
    );
};
