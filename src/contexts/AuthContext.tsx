import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type UserType = 'renter' | 'host' | 'both';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, businessName: string, location: string, userType?: UserType, signupSource?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Failsafe timer to ensure loading screen eventually disappears
    const failsafeTimer = setTimeout(() => {
      if (mounted) {
        setLoading(prev => {
          if (prev) {
            console.warn('Auth loading timed out. Forcing state resolution.');
            return false;
          }
          return false;
        });
      }
    }, 5000);

    // Initial session check
    const initAuth = async () => {
      try {
        // Race getSession with a timeout to prevent app-wide hang
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 2500)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const session = result?.data?.session;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_banned')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile?.is_banned) {
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              toast.error('Your account has been banned.');
              navigate('/auth');
            }
          }
        }
      } catch (err: any) {
        console.warn('Auth initialization bypass (using fallback):', err.message);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(failsafeTimer);
        }
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed event:', event);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(failsafeTimer);
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, businessName: string, location: string, userType: UserType = 'host', signupSource?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    // Capture UTM params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const capturedSource = signupSource || urlParams.get('utm_source') || urlParams.get('ref') || 'direct';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          business_name: businessName,
          location: location,
          user_type: userType,
          signup_source: capturedSource
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
