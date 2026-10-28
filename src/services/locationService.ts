import { LocationData } from '../types';

// Default fallback coordinates (Metropolitan Central Plaza)
const FALLBACK_LOCATION: LocationData = {
  lat: 12.9716,
  lng: 77.5946,
  address: 'Civic Plaza, MG Road District, Central Metro',
  accuracy: 12,
  timestamp: Date.now(),
  isLive: false,
  isPermissionGranted: false,
};

// Haversine Distance Formula in Kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Reverse Geocoding using OpenStreetMap Nominatim with Timeout Fallback
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'MercaEmergencyAssistant/1.0' },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Return clean truncated address
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    }
  } catch {
    // Ignore network error and return readable coordinate format
  }
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Near Civic Center)`;
}

export const locationService = {
  // Fetch Current User Location
  getCurrentLocation: async (): Promise<LocationData> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(FALLBACK_LOCATION);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 10);
          const address = await reverseGeocode(lat, lng);

          resolve({
            lat,
            lng,
            address,
            accuracy,
            timestamp: position.timestamp || Date.now(),
            isLive: true,
            isPermissionGranted: true,
          });
        },
        () => {
          // On Permission Denied or Timeout: return graceful simulated location
          resolve({
            ...FALLBACK_LOCATION,
            timestamp: Date.now(),
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000,
        }
      );
    });
  },

  // Generate Unique Shareable Location Token & Link
  generateShareUrl: (location: LocationData, durationMinutes = 60): string => {
    const token =
      'loc_' +
      Math.random().toString(36).substring(2, 9) +
      '_' +
      Date.now().toString(36);
    const origin = window.location.origin;
    return `${origin}/track?token=${token}&lat=${location.lat.toFixed(4)}&lng=${location.lng.toFixed(4)}&expires=${Date.now() + durationMinutes * 60000}`;
  },

  // Native Device Share / Clipboard Fallback
  shareLocationNative: async (
    title: string,
    text: string,
    url: string
  ): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch {
        // User cancelled or share failed
      }
    }
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\nLive Link: ${url}`);
      return true;
    } catch {
      return false;
    }
  },

  // Google Maps Direct Route Link
  getGoogleMapsDirectionsUrl: (destLat: number, destLng: number): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
  },
};
