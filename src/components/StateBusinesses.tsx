import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BusinessListing } from "@/hooks/useBusinessListings";

// State background images
import texasImg from "@/assets/states/texas.png";
import californiaImg from "@/assets/states/california.png";
import nevadaImg from "@/assets/states/nevada.png";
import arizonaImg from "@/assets/states/arizona.png";
import coloradoImg from "@/assets/states/colorado.png";
import georgiaImg from "@/assets/states/georgia.png";
import tennesseeImg from "@/assets/states/tennessee.png";
import utahImg from "@/assets/states/utah.png";
import minnesotaImg from "@/assets/states/minnesota.png";

interface StateCount {
    name: string;
    count: number;
    image: string;
}

interface StateBusinessesProps {
    businesses?: BusinessListing[];
}

export const StateBusinesses = ({ businesses = [] }: StateBusinessesProps) => {
    const stateData: StateCount[] = [
        { name: "Texas", count: 24, image: texasImg },
        { name: "California", count: 18, image: californiaImg },
        { name: "Nevada", count: 8, image: nevadaImg },
        { name: "Arizona", count: 12, image: arizonaImg },
        { name: "Colorado", count: 6, image: coloradoImg },
        { name: "Georgia", count: 10, image: georgiaImg },
        { name: "Tennessee", count: 7, image: tennesseeImg },
        { name: "Utah", count: 5, image: utahImg },
        { name: "Minnesota", count: 4, image: minnesotaImg },
    ];

    const updatedStateData = [...stateData];
    if (businesses.length > 0) {
        const actualCounts: Record<string, number> = {};
        businesses.forEach(b => {
            if (b.address) {
                const address = b.address.toUpperCase();
                stateData.forEach(s => {
                    if (address.includes(s.name.toUpperCase()) ||
                        address.includes(`, ${s.name.substring(0, 2).toUpperCase()} `)) {
                        actualCounts[s.name] = (actualCounts[s.name] || 0) + 1;
                    }
                });
            }
        });

        if (Object.keys(actualCounts).length > 0) {
            updatedStateData.forEach((s, i) => {
                if (actualCounts[s.name]) {
                    updatedStateData[i].count = actualCounts[s.name];
                }
            });
        }
    }

    return (
        <section className="bg-background py-16 border-t">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight font-display">
                        FIND BUSINESSES IN YOUR STATE
                    </h2>
                    <Link
                        to="/locations"
                        className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
                    >
                        View All Locations <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {updatedStateData.map((state) => (
                        <Link
                            key={state.name}
                            to={`/locations/${state.name.toLowerCase()}`}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500"
                        >
                            {/* Background Image */}
                            <img
                                src={state.image}
                                alt={`${state.name} landscape`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg font-display uppercase tracking-wider">
                                    {state.name}
                                </h3>
                                <p className="text-sm font-medium text-white/90 drop-shadow-md">
                                    ({state.count} businesses)
                                </p>
                            </div>

                            {/* Decorative Border */}
                            <div className="absolute inset-0 border-2 border-white/10 group-hover:border-primary/50 transition-colors duration-300 rounded-xl" />
                        </Link>
                    ))}

                    <Link
                        to="/locations"
                        className="relative aspect-[4/3] rounded-xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 bg-[#0A0F1C]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg font-display uppercase tracking-wider">
                                View All
                            </h3>
                            <p className="text-sm font-medium text-white/90 drop-shadow-md">
                                (50+ states)
                            </p>
                        </div>
                        <div className="absolute inset-0 border-2 border-white/10 group-hover:border-primary/50 transition-colors duration-300 rounded-xl" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
