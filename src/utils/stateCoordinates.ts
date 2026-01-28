export interface StateCenter {
    lat: number;
    lng: number;
    zoom: number;
}

export const STATE_COORDINATES: Record<string, StateCenter> = {
    texas: { lat: 31.9686, lng: -99.9018, zoom: 6 },
    georgia: { lat: 32.1656, lng: -82.9001, zoom: 7 },
    california: { lat: 36.7783, lng: -119.4179, zoom: 6 },
    nevada: { lat: 38.8026, lng: -116.4194, zoom: 7 },
    arizona: { lat: 34.0489, lng: -111.0937, zoom: 7 },
    colorado: { lat: 39.5501, lng: -105.7821, zoom: 7 },
    tennessee: { lat: 35.5175, lng: -86.5804, zoom: 7 },
    utah: { lat: 39.3210, lng: -111.0937, zoom: 7 },
    minnesota: { lat: 46.7296, lng: -94.6859, zoom: 7 },
    florida: { lat: 27.6648, lng: -81.5158, zoom: 7 },
    alabama: { lat: 32.3182, lng: -86.9023, zoom: 7 },
    arkansas: { lat: 35.2010, lng: -91.8318, zoom: 7 },
    louisiana: { lat: 30.9843, lng: -91.9623, zoom: 7 },
    mississippi: { lat: 32.3547, lng: -89.3985, zoom: 7 },
    oklahoma: { lat: 35.0078, lng: -97.0929, zoom: 7 },
    "new-mexico": { lat: 34.5199, lng: -105.8701, zoom: 7 },
};

export const getCenterForState = (stateSlug?: string): StateCenter | null => {
    if (!stateSlug) return null;
    return STATE_COORDINATES[stateSlug.toLowerCase()] || null;
};
