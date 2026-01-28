import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, MapPin, MessageSquare, Clock, User as UserIcon, Truck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Inquiry {
    id: string;
    created_at: string;
    status: string;
    message: string | null;
    date_needed: string | null;
    location: string | null;
    service_type: string | null;
    business_listings: {
        business_name: string;
        city: string | null;
        state: string | null;
    } | null;
}

const statusColors: Record<string, string> = {
    new_inquiry: "bg-blue-500/10 text-blue-500",
    contacted: "bg-yellow-500/10 text-yellow-500",
    qualified: "bg-purple-500/10 text-purple-500",
    converted: "bg-green-500/10 text-green-500",
    lost: "bg-red-500/10 text-red-500",
};

export default function RenterProfile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user?.email) {
            fetchRenterData();
        }
    }, [user]);

    const fetchRenterData = async () => {
        try {
            // Fetch profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user?.id)
                .single();

            setProfile(profileData);

            // Fetch inquiries tied to this email
            const { data: leadData, error } = await supabase
                .from("leads")
                .select(`
          *,
          business_listings (
            business_name,
            city,
            state
          )
        `)
                .eq("email", user?.email)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setInquiries(leadData || []);
        } catch (error) {
            console.error("Error fetching renter data:", error);
            toast({
                title: "Error",
                description: "Failed to load your inquiries.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Profile Summary */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0f1219] border border-white/5 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                        <UserIcon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tight">
                            {profile?.business_name || user?.email?.split('@')[0]}
                        </h1>
                        <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                            <Mail className="h-4 w-4" /> {user?.email}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                Renter Profile
                            </Badge>
                            {profile?.location && (
                                <Badge variant="outline" className="bg-white/5 text-gray-400 border-white/10">
                                    <MapPin className="h-3 w-3 mr-1" /> {profile.location}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Inquiries Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-wide">
                        My Fleet Inquiries
                    </h2>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                        {inquiries.length} TOTAL
                    </Badge>
                </div>

                {inquiries.length === 0 ? (
                    <Card className="bg-[#1A1F2C] border-dashed border-white/10 py-12 text-center">
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <MessageSquare className="h-8 w-8 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">No active inquiries</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        Start exploring our directory to find the perfect equipment for your next haul.
                                    </p>
                                </div>
                                <Button variant="default" asChild>
                                    <a href="/">Browse Equipment</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inquiries.map((inquiry) => (
                            <Card key={inquiry.id} className="bg-[#1A1F2C] border-white/10 hover:border-primary/50 transition-all group overflow-hidden">
                                <CardHeader className="pb-4 border-b border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={statusColors[inquiry.status] || "bg-gray-500/10 text-gray-500"}>
                                            {inquiry.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                        {inquiry.business_listings?.business_name || "Unknown Vendor"}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {inquiry.business_listings?.city}, {inquiry.business_listings?.state || "TX"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span>{inquiry.date_needed ? format(new Date(inquiry.date_needed), "PPP") : "TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <Truck className="h-4 w-4 text-primary" />
                                            <span>{inquiry.service_type || "General Inquiry"}</span>
                                        </div>
                                    </div>

                                    {inquiry.message && (
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400 italic mb-1">Your message:</p>
                                            <p className="text-sm text-gray-300 line-clamp-2 italic">"{inquiry.message}"</p>
                                        </div>
                                    )}

                                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                                        Message Vendor
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
