import { supabase } from "@/integrations/supabase/client";

type InteractionType =
  | 'profile_view'
  | 'click_to_call'
  | 'click_to_email'
  | 'click_website'
  | 'click_booking'
  | 'click_social'
  | 'button_click'
  | 'form_submit'
  | 'unit_view'
  | 'unit_inquiry'
  | 'search_impression';

interface TrackInteractionParams {
  hostId: string;
  interactionType: InteractionType;
  triggerLinkId?: string;
  source?: string;
  serviceId?: string;
}

export const trackInteraction = async ({
  hostId,
  interactionType,
  triggerLinkId,
  source,
  serviceId
}: TrackInteractionParams) => {
  try {
    const { error } = await supabase.functions.invoke('track-interaction', {
      body: {
        host_id: hostId,
        interaction_type: interactionType,
        trigger_link_id: triggerLinkId,
        source: source,
        service_id: serviceId
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

  const trackClickToEmail = () => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'click_to_email', source: 'profile' });
    }
  };

  const trackClickWebsite = () => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'click_website', source: 'profile' });
    }
  };

  const trackClickBooking = () => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'click_booking', source: 'profile' });
    }
  };

  const trackClickSocial = (platform: string) => {
    if (hostId) {
      trackInteraction({ hostId, interactionType: 'click_social', source: platform });
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

  const trackFormSubmit = (formName?: string, serviceId?: string) => {
    if (hostId) {
      trackInteraction({
        hostId,
        interactionType: 'form_submit',
        source: formName || 'lead_form',
        serviceId
      });
    }
  };

  const trackUnitView = (serviceId: string) => {
    if (hostId) {
      trackInteraction({
        hostId,
        interactionType: 'unit_view',
        source: 'profile',
        serviceId
      });
    }
  };

  const trackUnitInquiry = (serviceId: string) => {
    if (hostId) {
      trackInteraction({
        hostId,
        interactionType: 'unit_inquiry',
        source: 'profile',
        serviceId
      });
    }
  };

  return {
    trackProfileView,
    trackClickToCall,
    trackClickToEmail,
    trackClickWebsite,
    trackClickBooking,
    trackClickSocial,
    trackButtonClick,
    trackFormSubmit,
    trackUnitView,
    trackUnitInquiry,
    trackSearchImpression: (listingId: string) => {
      trackInteraction({ hostId: listingId, interactionType: 'search_impression', source: 'search_results' });
    }
  };
};
