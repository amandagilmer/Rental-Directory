import { useState, useEffect } from 'react';
import { useMapsLibrary, APIProvider } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

/**
 * Main component that provides the Google Maps API context.
 * Hooks like useMapsLibrary MUST be used in a child of APIProvider.
 */
export default function GoogleBusinessConnect(props: GoogleBusinessConnectProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
                <CardTitle className="text-destructive flex items-center justify-center gap-2 mb-2">
                    <X className="h-5 w-5" />
                    Google Maps API Key Missing
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Please ensure VITE_GOOGLE_MAPS_API_KEY is set in your environment variables.
                </p>
            </Card>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <GoogleBusinessConnectContent {...props} />
        </APIProvider>
    );
}

/**
 * The actual implementation logic, now safely inside the APIProvider context.
 */
function GoogleBusinessConnectContent({ listingId, businessName, onSuccess }: GoogleBusinessConnectProps) {
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
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [useMagicSync, setUseMagicSync] = useState(true);

    // Initialize PlacesService once the library is loaded
    useEffect(() => {
        if (!placesLibrary) return;
        console.log('[Magic Sync] Places Library loaded');
        const dummy = document.createElement('div');
        setPlacesService(new placesLibrary.PlacesService(dummy));
    }, [placesLibrary]);

    useEffect(() => {
        const handleToken = (token: string) => {
            setAccessToken(token);
            setStep('discover');
            toast.success("Google connected!");
        };

        // 1. Session Check
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.provider_token) {
                handleToken(session.provider_token);
            }
        };
        checkSession();

        // 2. Hash Fragment Check (for popups)
        const hash = window.location.hash;
        if (hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                if (window.opener) {
                    window.opener.postMessage({ type: 'GMB_TOKEN', token }, '*');
                    setTimeout(() => window.close(), 500);
                } else {
                    handleToken(token);
                    window.history.replaceState(null, '', window.location.pathname);
                }
            }
        }

        // 3. postMessage Listener
        const messageListener = (event: MessageEvent) => {
            if (event.data?.type === 'GMB_TOKEN') {
                handleToken(event.data.token);
            }
        };
        window.addEventListener('message', messageListener);
        return () => window.removeEventListener('message', messageListener);
    }, []);

    useEffect(() => {
        if (accessToken && step === 'discover') {
            setUseMagicSync(false);
            fetchGMBLocations();
        }
    }, [accessToken, step]);

    const handleSearch = async () => {
        if (!query || searching) return;

        setSearching(true);
        console.log('[Magic Sync] Searching via Backend Bypass:', query);

        try {
            const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
                body: {
                    mode: 'search',
                    query: query
                },
            });

            if (error) throw error;

            if (data?.error) {
                console.error('[Magic Sync] Backend reported error:', data.error, data.details);
                toast.error(`${data.error}: ${data.details}`);
                setResults([]);
                return;
            }

            if (data?.results) {
                const mappedResults = data.results.map((r: any) => ({
                    place_id: r.place_id || '',
                    name: r.name || '',
                    formatted_address: r.formatted_address || ''
                }));
                setResults(mappedResults);
                if (mappedResults.length === 0) toast.info("No businesses found.");
            } else {
                toast.info("No businesses found matching that name.");
                setResults([]);
            }
        } catch (err: any) {
            console.error('Search failed:', err);
            toast.error("Discovery failed. Using backend fallback...");

            // Fallback attempt to JS client if backend fails (though JS client likely has restriction errors)
            if (placesService) {
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
                    }
                });
            } else {
                setSearching(false);
            }
        } finally {
            setSearching(false);
        }
    };

    async function fetchGMBLocations() {
        setLoadingLocations(true);
        try {
            const accountsResp = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const accountsData = await accountsResp.json();

            if (!accountsData.accounts || accountsData.accounts.length === 0) {
                toast.error("No GMB accounts found.");
                setStep('initial');
                return;
            }

            const accountName = accountsData.accounts[0].name;
            const locationsResp = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const locationsData = await locationsResp.json();

            if (locationsData.locations) {
                const mapped = locationsData.locations.map((l: any) => ({
                    place_id: l.name,
                    name: l.title,
                    formatted_address: l.storefrontAddress?.addressLines?.join(', ') || 'Service Area'
                }));
                setLocations(mapped);
            }
        } catch (err: any) {
            console.error('Fetch GMB failed:', err);
            toast.error("Failed to load profiles.");
        } finally {
            setLoadingLocations(false);
        }
    }

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const { error } = await supabase.auth.linkIdentity({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/business.manage',
                    redirectTo: window.location.origin + window.location.pathname
                }
            });

            if (error && (error.message.includes('disabled') || error.message.includes('identity'))) {
                const clientId = "560886543412-sl92rd15hur2rn7vbsuu2votot5qooqo.apps.googleusercontent.com";
                const redirectUri = window.location.origin + window.location.pathname;
                const scope = "https://www.googleapis.com/auth/business.manage";
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;

                const width = 500, height = 600;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);
                window.open(authUrl, 'GoogleSync', `width=${width},height=${height},left=${left},top=${top}`);
            } else if (error) {
                throw error;
            }
        } catch (error: any) {
            toast.error(`Connection failed: ${error.message}`);
        } finally {
            setConnecting(false);
        }
    };

    const handleMagicSync = async (place: PlaceResult) => {
        setSyncing(true);
        try {
            const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
                body: {
                    business_id: listingId,
                    place_id: place.place_id
                },
            });

            if (error) throw error;

            toast.success(`Found your business! Imported ${data.count || 0} reviews.`);
            setStep('sync');
            setIsVerified(true);
            onSuccess();
        } catch (err: any) {
            console.error('[Magic Sync] Failed:', err);
            toast.error("Failed to sync reviews instantly.");
        } finally {
            setSyncing(false);
        }
    };

    async function performSync() {
        if (!selectedPlace || syncing) return;
        setSyncing(true);

        try {
            const { error: updateError } = await supabase
                .from('business_listings')
                .update({ place_id: selectedPlace.place_id })
                .eq('id', listingId);

            if (updateError) throw updateError;

            const { data, error } = await supabase.functions.invoke('import-gmb-reviews', {
                body: {
                    business_id: listingId,
                    place_id: selectedPlace.place_id,
                    access_token: accessToken
                },
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

    return (
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

            {/* Stepper Progress */}
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
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black tracking-tight text-slate-800">Find your Google Business Profile</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                    Sync your verified 5-star reputation. One-click, no login required.
                                </p>
                            </div>
                            <div className="pt-4 space-y-4">
                                {useMagicSync ? (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                                        <div className="relative group/search">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                                            <Input
                                                placeholder="Search your business name on Google..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="pl-12 h-14 bg-white/50 border-gray-200 text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all shadow-sm"
                                            />
                                            <Button
                                                onClick={handleSearch}
                                                disabled={searching}
                                                className="absolute right-2 top-2 h-10 px-6 rounded-xl font-bold uppercase tracking-tight"
                                            >
                                                {searching ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Find Business"}
                                            </Button>
                                        </div>

                                        {results.length > 0 && (
                                            <div className="grid gap-3 max-h-[300px] overflow-y-auto p-2 border-2 border-dashed border-primary/10 rounded-2xl bg-primary/[0.01]">
                                                {results.map((result) => (
                                                    <Button
                                                        key={result.place_id}
                                                        variant="outline"
                                                        onClick={() => handleMagicSync(result)}
                                                        disabled={syncing}
                                                        className="h-auto p-4 flex flex-col items-start gap-1 text-left bg-white hover:bg-primary/5 hover:border-primary transition-all duration-300 group rounded-xl shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                            {result.name}
                                                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground opacity-70 truncate w-full">
                                                            {result.formatted_address}
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center gap-4">
                                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-full">
                                                <Info className="h-3 w-3" />
                                                One-click sync: We'll grab your top 5 reviews instantly.
                                            </p>
                                            <Button
                                                variant="link"
                                                onClick={() => setUseMagicSync(false)}
                                                className="text-[10px] text-slate-400 hover:text-primary uppercase tracking-widest font-black"
                                            >
                                                Advanced: Connect Full Google Account (OAuth)
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        <Button
                                            onClick={handleConnect}
                                            disabled={connecting}
                                            className="w-full h-14 bg-[#4285F4] hover:bg-[#357ae8] text-white rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98] group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            {connecting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            )}
                                            <span className="relative">Connect with Google</span>
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => setUseMagicSync(true)}
                                            className="text-[10px] text-slate-400 hover:text-primary uppercase tracking-widest font-black"
                                        >
                                            Back to One-Click Search (Instant Sync)
                                        </Button>
                                        <div className="block pt-2">
                                            <Button
                                                variant="link"
                                                className="text-muted-foreground text-[10px] hover:text-primary transition-colors h-auto p-0 opacity-50"
                                                onClick={() => { setAccessToken(null); setStep('initial'); }}
                                            >
                                                Reset GMB Bridge
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'discover' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-0 shadow-xl overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-xl">
                                {locations.length > 0 ? "Select Your Business Profile" : "Find Your Listing"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {loadingLocations ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-sm font-medium animate-pulse text-muted-foreground uppercase tracking-widest">Accessing Google Ecosystem...</p>
                                </div>
                            ) : locations.length > 0 ? (
                                <div className="grid gap-3">
                                    {locations.map((loc) => (
                                        <button
                                            key={loc.place_id}
                                            onClick={() => { setSelectedPlace(loc); setStep('verify'); }}
                                            className="w-full p-5 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <Star className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{loc.name}</div>
                                                    <div className="text-sm text-muted-foreground">{loc.formatted_address}</div>
                                                </div>
                                                <CheckCircle2 className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Enter business name..."
                                                className="pl-10 h-12 bg-muted/30 border-0"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                        </div>
                                        <Button onClick={handleSearch} disabled={searching} className="h-12 px-8">
                                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                                        </Button>
                                    </div>
                                    {results.length > 0 && (
                                        <div className="space-y-2 mt-6">
                                            {results.map((r) => (
                                                <button
                                                    key={r.place_id}
                                                    onClick={() => { setSelectedPlace(r); setStep('verify'); }}
                                                    className="w-full p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-all group"
                                                >
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</div>
                                                    <div className="text-sm text-muted-foreground">{r.formatted_address}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'verify' && selectedPlace && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="border-2 border-secondary shadow-xl overflow-hidden">
                        <CardHeader className="bg-secondary/10 border-b border-secondary/20">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Owner Verification</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setStep('discover')}><X className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                <div className="flex items-start gap-4">
                                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">{selectedPlace.name}</h4>
                                        <p className="text-sm text-muted-foreground">{selectedPlace.formatted_address}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="verify-check" className="w-5 h-5" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
                                <label htmlFor="verify-check" className="text-sm font-medium">I confirm I own or manage this profile.</label>
                            </div>
                            <Button className="w-full h-14 text-lg font-bold" disabled={!isVerified} onClick={() => setStep('sync')}>Verify & Continue</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'sync' && selectedPlace && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-8">
                        <RefreshCw className={`h-16 w-16 text-primary ${syncing ? 'animate-spin' : ''}`} />
                        <h3 className="text-2xl font-black uppercase italic">Ready to Sync</h3>
                        <Button className="h-14 w-full max-w-xs text-lg font-bold" disabled={syncing} onClick={performSync}>
                            {syncing ? 'Processing...' : 'Begin Sync'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
