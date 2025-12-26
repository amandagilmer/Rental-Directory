import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function TriggerRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        navigate('/');
        return;
      }

      try {
        const { data, error: funcError } = await supabase.functions.invoke('trigger-redirect', {
          body: {},
          headers: {},
        });

        // Since we can't pass query params easily, let's call it differently
        // We'll look up the link directly and track via the track-interaction function
        const { data: link, error: linkError } = await supabase
          .from('trigger_links')
          .select('*')
          .eq('code', code.toUpperCase())
          .single();

        if (linkError || !link) {
          setError('Link not found');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Increment click count
        await supabase
          .from('trigger_links')
          .update({ click_count: (link.click_count || 0) + 1 })
          .eq('id', link.id);

        // Track the interaction
        await supabase.functions.invoke('track-interaction', {
          body: {
            host_id: link.host_id,
            interaction_type: link.link_type === 'profile' ? 'profile_view' : 
                              link.link_type === 'call' ? 'click_to_call' : 'button_click',
            trigger_link_id: link.id,
            source: 'trigger_link'
          }
        });

        // Redirect based on link type
        if (link.link_type === 'call' && link.destination.startsWith('tel:')) {
          window.location.href = link.destination;
        } else {
          // For profile and form links, navigate to the destination
          window.location.href = link.destination;
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Something went wrong');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleRedirect();
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-destructive text-lg mb-2">{error}</p>
            <p className="text-muted-foreground">Redirecting to homepage...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}