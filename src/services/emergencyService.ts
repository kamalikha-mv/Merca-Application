import { LocationData, TrustedContact, EmergencyCategory } from '../types';

export const emergencyService = {
  // Format message text with location and timestamp
  buildEmergencyMessage: (
    category: EmergencyCategory,
    location: LocationData,
    customText?: string
  ): string => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mapsLink = `https://maps.google.com/?q=${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;

    const header = `🚨 [MECRA EMERGENCY ALERT - ${category.toUpperCase()}] 🚨`;
    const details = customText || 'I need immediate assistance at my current location.';
    const locInfo = `📍 Address: ${location.address}\n🌐 Coordinates: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}\n🗺️ Live Map: ${mapsLink}`;
    const footer = `⏰ Time: ${time}\n(Sent via Mecra Mobile Emergency Assistant)`;

    return `${header}\n\n${details}\n\n${locInfo}\n\n${footer}`;
  },

  // Open native Phone dialer
  callNumber: (phone: string): void => {
    const sanitized = phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${sanitized}`;
  },

  // Open native SMS app with pre-filled message
  openSmsApp: (phone: string, message: string): void => {
    const sanitized = phone.replace(/[^0-9+]/g, '');
    const encoded = encodeURIComponent(message);
    window.location.href = `sms:${sanitized}?body=${encoded}`;
  },

  // Open WhatsApp with pre-filled message
  openWhatsApp: (phone: string, message: string): void => {
    const sanitized = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${sanitized}?text=${encoded}`, '_blank');
  },

  // Build Safe Resolution Message
  buildSafeMessage: (contactName: string): string => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `✅ [MECRA UPDATE - SAFE CONFIRMATION]\nHi ${contactName}, I am confirmed safe now. The emergency alert has been resolved at ${time}. Thank you!`;
  },
};
