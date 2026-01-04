
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFavorites = (businessId?: string) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Check if current business is favorited (if ID provided)
    useEffect(() => {
        if (businessId) {
            checkFavoriteStatus();
        }
    }, [businessId]);

    // Load all favorites for list checking
    const loadFavorites = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('business_id');

        if (error) {
            console.error('Error loading favorites:', error);
            return;
        }

        if (data) {
            setFavoriteIds(new Set(data.map(f => f.business_id)));
        }
    };

    const checkFavoriteStatus = async () => {
        if (!businessId) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('business_id', businessId)
            .maybeSingle();

        if (!error && data) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    };

    const toggleFavorite = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Please sign in to save favorites");
            return;
        }

        if (!businessId) return;

        setLoading(true);

        // Optimistic update
        const previousState = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            if (previousState) {
                // Remove favorite
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('business_id', businessId);

                if (error) throw error;
                toast.success("Removed from favorites");
                favoriteIds.delete(businessId);
            } else {
                // Add favorite
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, business_id: businessId });

                if (error) throw error;
                toast.success("Saved to favorites");
                favoriteIds.add(businessId);
            }
            setFavoriteIds(new Set(favoriteIds));

        } catch (error) {
            // Revert optimistic update
            setIsFavorite(previousState);
            toast.error("Failed to update favorite");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return { isFavorite, toggleFavorite, loading, loadFavorites, favoriteIds };
};
