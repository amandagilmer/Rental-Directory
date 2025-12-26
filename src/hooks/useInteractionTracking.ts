import { supabase } from "@/integrations/supabase/client";

type InteractionType = 'profile_view' | 'click_to_call' | 'button_click' | 'form_submit';

interface TrackInteractionParams {
  hostId: string;
  interactionType: InteractionType;
  triggerLinkId?: string;
  source?: string;
}

export const trackInteraction = async ({
  hostId,
  interactionType,
  triggerLinkId,
  source
}: TrackInteractionParams) => {
  try {
    const { error } = await supabase.functions.invoke('track-interaction', {
      body: {
        host_id: hostId,
        interaction_type: interactionType,
        trigger_link_id: triggerLinkId,
        source: source
      }
    });

    if (error) {
      console.error('Error tracking interaction:', error);
    }
  } catch (err) {
    // Silently fail - tracking should never block UX
    console.error('Failed to track interaction:', err);
  }
};

export const useInteractionTracking = (hostId: string | null) => {
  const trackProfileView = () => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'profile_view', source: 'direct' });
    }
  };

  const trackClickToCall = () => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'click_to_call', source: 'profile' });
    }
  };

  const trackButtonClick = (buttonName?: string) => {
    if (hostId) {
      trackInteraction({ 
        hostId, 
        interactionType: 'button_click', 
        source: buttonName || 'profile' 
      });
    }
  };

  const trackFormSubmit = (formName?: string) => {
    if (hostId) {
      trackInteraction({ 
        hostId, 
        interactionType: 'form_submit', 
        source: formName || 'lead_form' 
      });
    }
  };

  return {
    trackProfileView,
    trackClickToCall,
    trackButtonClick,
    trackFormSubmit
  };
};
