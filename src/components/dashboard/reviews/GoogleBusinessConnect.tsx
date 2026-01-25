import { useState, useEffect } from 'react';
import { useMapsLibrary, APIProvider } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, CheckCircle2, ShieldCheck, RefreshCw, X, Info, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GoogleBusinessConnectProps {
    listingId: string;
    businessName: string;
    onSuccess: () => void;
}

interface PlaceResult {
    place_id: string;
    name: string;
    formatted_address: string;
}

export default function GoogleBusinessConnect({ listingId, businessName, onSuccess }: GoogleBusinessConnectProps) {
    const [step, setStep] = useState<'initial' | 'discover' | 'verify' | 'sync'>('initial');
    const placesLibrary = useMapsLibrary('places');
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState(businessName);
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // We removed the auto-skip useEffect to ensure the user always sees the 
    // "Establish Trust" and "Connect with Google" landing page first.
    useEffect(() => {
        // Check if we just returned from a successful OAuth flow
        const params = new URLSearchParams(window.location.search);
        if (params.get('type') === 'recovery' || params.get('code')) {
            // This is a rough way to detect return, but let's check session too
            const checkSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.app_metadata?.provider === 'google' || session?.user?.identities?.some(id => id.provider === 'google')) {
                    setStep('discover');
                }
            };
            checkSession();
        }
    }, []);

    useEffect(() => {
        if (!placesLibrary) return;
        // Create a dummy div for PlacesService as it requires a map or a div
        const dummy = document.createElement('div');
        setPlacesService(new placesLibrary.PlacesService(dummy));
    }, [placesLibrary]);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('OAuth failed:', err);
            toast.error("Failed to connect with Google. Please try again.");
            setConnecting(false);
        }
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Credibility Header */}
                <div className="text-center space-y-3 pb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Star className="h-3 w-3 fill-primary" />
                        Establish Trust Immediately
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight">One-Time Reputation Sync</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                        Bridge your existing success from Google directly into Patriot Hauls. This is a <strong>one-time sync</strong> designed to give established businesses the instant credibility they deserve on our platform.
                    </p>
                </div>

                {/* Stepper Progress (Hidden in initial state) */}
                {step !== 'initial' && (
                    <div className="flex items-center justify-between px-12 mb-12 max-w-3xl mx-auto">
                        {[
                            { id: 'discover', label: 'Link Listing', icon: Search },
                            { id: 'verify', label: 'Verify', icon: ShieldCheck },
                            { id: 'sync', label: 'Sync', icon: RefreshCw },
                        ].map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex flex-col items-center gap-2 ${step === s.id ? 'text-primary' :
                                    (i < ['discover', 'verify', 'sync'].indexOf(step) ? 'text-green-500' : 'text-muted-foreground')
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${step === s.id ? 'border-primary bg-primary/5 scale-110 shadow-lg shadow-primary/20' :
                                        (i < ['discover', 'verify', 'sync'].indexOf(step) ? 'border-green-500 bg-green-500/5' : 'border-muted')
                                        }`}>
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                                </div>
                                {i < 2 && (
                                    <div className={`h-[1px] flex-1 mx-4 transition-colors duration-1000 ${i < ['discover', 'verify', 'sync'].indexOf(step) ? 'bg-green-500' : 'bg-muted'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {step === 'initial' && (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        <Card className="border-0 shadow-2xl bg-card overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] pointer-events-none" />
                            <CardContent className="p-12 text-center space-y-8 relative">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110 duration-500 border border-gray-100">
                                    <svg className="h-12 w-12" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black tracking-tight text-slate-800">Connect your Google Business Profile</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                        Securely bridge your Google ecosystem into Patriot Hauls to sync your verified 5-star reputation.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        onClick={handleConnect}
                                        disabled={connecting}
                                        className="h-16 px-16 bg-[#4285F4] hover:bg-[#357ae8] text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 group/btn"
                                    >
                                        {connecting ? (
                                            <>
                                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                                Bridging...
                                            </>
                                        ) : (
                                            <span className="flex items-center gap-3">
                                                Connect with Google
                                                <RefreshCw className="h-5 w-5 opacity-50 group-hover/btn:rotate-180 transition-transform duration-700" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {step === 'discover' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-0 shadow-xl overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="text-xl">Find Your Listing</CardTitle>
                                <CardDescription>Search for your business to link it to your profile</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Enter business name..."
                                            className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <Button onClick={handleSearch} disabled={searching} className="h-12 px-8">
                                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                                    </Button>
                                </div>

                                {results.length > 0 && (
                                    <div className="space-y-2 mt-6">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Top Matches</p>
                                        {results.map((r) => (
                                            <button
                                                key={r.place_id}
                                                onClick={() => {
                                                    setSelectedPlace(r);
                                                    setStep('verify');
                                                }}
                                                className="w-full p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-all group relative"
                                            >
                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</div>
                                                <div className="text-sm text-muted-foreground">{r.formatted_address}</div>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <p className="text-center text-xs text-muted-foreground italic">
                            Can't find your listing? Try adding your city or state to the search.
                        </p>
                    </div>
                )}

                {step === 'verify' && selectedPlace && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                        <Card className="border-2 border-secondary shadow-xl overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b border-secondary/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">Owner Verification</CardTitle>
                                        <CardDescription>Confirm your connection to this listing</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setStep('discover')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{selectedPlace.name}</h4>
                                            <p className="text-sm text-muted-foreground">{selectedPlace.formatted_address}</p>
                                            <div className="mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block font-mono">
                                                PLACE_ID: {selectedPlace.place_id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                                        <Info className="h-5 w-5 text-yellow-500 shrink-0" />
                                        <p className="text-sm text-yellow-700">
                                            By proceeding, you verify that you are an authorized representative of <strong>{selectedPlace.name}</strong>. This one-time sync will pull your public Google reviews into your Patriot Hauls profile.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="verify-check"
                                            className="w-5 h-5 rounded border-muted-foreground"
                                            checked={isVerified}
                                            onChange={(e) => setIsVerified(e.target.checked)}
                                        />
                                        <label htmlFor="verify-check" className="text-sm font-medium cursor-pointer">
                                            I confirm I own or manage this Google Business Profile.
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 text-lg font-bold"
                                    disabled={!isVerified}
                                    onClick={() => setStep('sync')}
                                >
                                    Verify \u0026 Continue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {step === 'sync' && selectedPlace && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Card className="border-0 bg-background shadow-2xl overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
                            <div className="p-12 space-y-8">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto ${syncing ? 'animate-pulse' : ''}`}>
                                        <RefreshCw className={`h-16 w-16 text-primary ${syncing ? 'animate-spin' : ''}`} />
                                    </div>
                                    {syncing && (
                                        <div className="absolute inset-x-0 -bottom-4 animate-bounce">
                                            <div className="text-[10px] font-black tracking-widest text-primary uppercase">Syncing Reputation...</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black italic uppercase tracking-wider">Ready for Deployment</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        We're about to bridge your Google reputation into the Patriot Hauls ecosystem. This will give your profile an immediate trust boost.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                                    <Button
                                        className="h-14 w-full text-lg font-bold uppercase transition-all hover:scale-105 active:scale-95"
                                        disabled={syncing}
                                        onClick={performSync}
                                    >
                                        {syncing ? 'Processing Data...' : 'Begin Reputation Sync'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-12 uppercase text-xs font-bold tracking-widest"
                                        disabled={syncing}
                                        onClick={() => setStep('verify')}
                                    >
                                        Back to Verification
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </APIProvider>
    );

    async function handleSearch() {
        if (!query || !placesService || searching) return;
        setSearching(true);

        try {
            placesService.textSearch({
                query: query,
                type: 'establishment'
            }, (results, status) => {
                setSearching(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const mappedResults = results.map(r => ({
                        place_id: r.place_id || '',
                        name: r.name || '',
                        formatted_address: r.formatted_address || ''
                    }));
                    setResults(mappedResults);
                    if (mappedResults.length === 0) toast.info("No businesses found matching that name.");
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    toast.info("No businesses found matching that name.");
                    setResults([]);
                } else {
                    console.error('Places API status:', status);
                    toast.error("Discovery failed. Check your connection or API key.");
                }
            });
        } catch (err: any) {
            console.error('Search failed:', err);
            toast.error("Connection failed. Please try again.");
            setSearching(false);
        }
    }

    async function performSync() {
        if (!selectedPlace || syncing) return;
        setSyncing(true);

        try {
            // 1. Update the listing with the new place_id
            const { error: updateError } = await supabase
                .from('business_listings')
                .update({ place_id: selectedPlace.place_id })
                .eq('id', listingId);

            if (updateError) throw updateError;

            // 2. Trigger the import edge function
            const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
                body: { business_id: listingId, place_id: selectedPlace.place_id },
            });

            if (error) throw error;

            toast.success("Reputation bridged successfully!");
            onSuccess();
        } catch (err: any) {
            console.error('Sync failed:', err);
            toast.error(err.message || "Failed to bridge reviews.");
        } finally {
            setSyncing(false);
        }
    }
}
