import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlanTier = 'Free' | 'Pro' | 'Premium' | 'Enterprise';

export interface SubscriptionData {
    plan: PlanTier;
    status: string;
    features: string[];
    loading: boolean;
    hasFeature: (featureName: string) => boolean;
}

export function useSubscription(): SubscriptionData {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [planData, setPlanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch profile with joined plan data
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*, plan_id (*)')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching subscription:', error);
                } else {
                    setProfile(data);
                    setPlanData(data.plan_id);
                }
            } catch (error) {
                console.error('Error in useSubscription:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user]);

    const hasFeature = (featureName: string) => {
        if (!planData?.features) return false;
        // Check if the feature name (case insensitive) is in the array
        return planData.features.some((f: string) =>
            f.toLowerCase().includes(featureName.toLowerCase())
        );
    };

    return {
        plan: (profile?.plan as PlanTier) || 'Free',
        status: profile?.subscription_status || 'active',
        features: planData?.features || [],
        loading,
        hasFeature
    };
}
