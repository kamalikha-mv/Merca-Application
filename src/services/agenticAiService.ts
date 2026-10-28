import {
  AgentChatMessage,
  LocationData,
  TrustedContact,
  MedicalProfile,
  EmergencyCategory,
} from '../types';
import { localDb } from './storage';
import { locationService } from './locationService';

export interface AgentContext {
  location: LocationData;
  activeCategory?: EmergencyCategory;
  medical: MedicalProfile;
  contacts: TrustedContact[];
  onTriggerEmergency?: (category: EmergencyCategory) => void;
  onDispatchPolice?: () => void;
  onSendContactAlert?: (contactId: string) => void;
  onResolveSafe?: () => void;
}

export const agenticAiService = {
  // Process user input and return context-aware AI response with tool-call execution
  processMessage: async (
    userInput: string,
    context: AgentContext
  ): Promise<AgentChatMessage> => {
    const text = userInput.toLowerCase();
    const id = 'msg-' + Date.now();
    const timestamp = Date.now();

    // 1. TOOL: TRIGGER IMMEDIATE SOS / EMERGENCY
    if (
      text.includes('help') ||
      text.includes('danger') ||
      text.includes('sos') ||
      text.includes('unsafe') ||
      text.includes('attack') ||
      text.includes('threat')
    ) {
      if (context.onTriggerEmergency) context.onTriggerEmergency('unsafe');

      return {
        id,
        sender: 'agent',
        text: `I have detected an urgent safety situation. I am executing the emergency workflow now:
1. Marked your live GPS at "${context.location.address}".
2. Prepared dispatch alert for Metropolitan Central Police.
3. Priority 1 contact (${context.contacts[0]?.name || 'Primary Contact'}) is in queue.

If it is safe, move toward a public, well-lit place or staff member. Do you want me to initiate the police call?`,
        timestamp,
        suggestions: [
          'Yes, call police now',
          'Send SMS to Sarah',
          'I am in a safe spot now',
          'Show nearest safe haven',
        ],
        executedTool: {
          name: 'executeEmergencyProtocol',
          result: `Protocol activated: Location verified at ${context.location.lat.toFixed(4)}, ${context.location.lng.toFixed(4)}. Emergency alert initiated.`,
          actionType: 'dispatch',
        },
      };
    }

    // 2. TOOL: MEDICAL ASSISTANCE
    if (
      text.includes('medical') ||
      text.includes('heart') ||
      text.includes('breathe') ||
      text.includes('asthma') ||
      text.includes('injury') ||
      text.includes('blood') ||
      text.includes('doctor')
    ) {
      if (context.onTriggerEmergency) context.onTriggerEmergency('medical');

      return {
        id,
        sender: 'agent',
        text: `Medical urgency registered.
- Patient: ${context.medical.fullName} (Blood: ${context.medical.bloodType})
- Medical note: ${context.medical.emergencyNotes}
- Nearest Facility: St. Jude Memorial Trauma & Emergency Hospital (1.2 km away, ER Open 24/7).

I can prepare the ambulance dispatch package or call St. Jude Emergency directly.`,
        timestamp,
        suggestions: [
          'Call St. Jude ER',
          'Notify Priority 1 Contact',
          'Show route to Hospital',
          'I am feeling better',
        ],
        executedTool: {
          name: 'findNearestHospital',
          result: 'Located St. Jude Memorial Hospital (1.2 km). Emergency contacts notified with medical brief.',
          actionType: 'call',
        },
      };
    }

    // 3. TOOL: VEHICLE BREAKDOWN
    if (
      text.includes('breakdown') ||
      text.includes('puncture') ||
      text.includes('flat tyre') ||
      text.includes('battery') ||
      text.includes('tow') ||
      text.includes('car') ||
      text.includes('bike')
    ) {
      const mechanics = localDb.getServices('mechanic');
      const nearest = mechanics[0];

      return {
        id,
        sender: 'agent',
        text: `Vehicle assistance protocol engaged.
First, turn on hazard lights and ensure you and passengers are safe from moving traffic.
- Nearest verified service: ${nearest ? nearest.name : 'SpeedyRecovery 24/7 Roadside'} (${nearest ? nearest.distanceKm : 0.7} km away).
- Phone: ${nearest ? nearest.phone : '(555) 869-4433'}.

Would you like me to open the Vehicle Breakdown Wizard or connect you with the mechanic?`,
        timestamp,
        suggestions: [
          'Open Breakdown Wizard',
          'Call Mechanic now',
          'Share my breakdown location',
          'Tow truck needed',
        ],
        executedTool: {
          name: 'locateRoadsideAssistance',
          result: `Matched ${nearest?.name || 'SpeedyRecovery'} (0.7 km). Average response time: 14 mins.`,
          actionType: 'call',
        },
      };
    }

    // 4. TOOL: LOCATION SHARING
    if (
      text.includes('share location') ||
      text.includes('send location') ||
      text.includes('where am i') ||
      text.includes('tracking')
    ) {
      const link = locationService.generateShareUrl(context.location, 60);

      return {
        id,
        sender: 'agent',
        text: `Here is your live location:
- Address: ${context.location.address}
- Coordinates: ${context.location.lat.toFixed(5)}° N, ${context.location.lng.toFixed(5)}° E
- Accuracy: Within ±${context.location.accuracy} meters

I have generated a secure live tracking link that expires in 60 minutes:
${link}`,
        timestamp,
        suggestions: [
          'Share via WhatsApp',
          'Send SMS to Sarah',
          'Copy tracking link',
          'Show on interactive map',
        ],
        executedTool: {
          name: 'generateLiveShareLink',
          result: `Generated secure URL: ${link}`,
          actionType: 'share',
        },
      };
    }

    // 5. TOOL: RESOLVE / CANCEL EMERGENCY
    if (
      text.includes('safe now') ||
      text.includes('cancel') ||
      text.includes('i am fine') ||
      text.includes('resolved') ||
      text.includes('saved')
    ) {
      if (context.onResolveSafe) context.onResolveSafe();

      return {
        id,
        sender: 'agent',
        text: `Understood! I have marked your status as **SAFE**.
- Alert cancelled on device.
- Safety check-in logged.
- Priority contacts and police dispatch log updated with your safe confirmation.

We are keeping your log secure in local storage. Take a deep breath!`,
        timestamp,
        suggestions: [
          'Return to Home Dashboard',
          'Send "I am safe" update to contacts',
          'View Event Summary',
        ],
        executedTool: {
          name: 'markUserSafeAndNotify',
          result: 'Emergency state cleared. Contacts alerted of safe status.',
          actionType: 'dispatch',
        },
      };
    }

    // 6. DEFAULT CALM SITUATIONAL GUIDANCE
    return {
      id,
      sender: 'agent',
      text: `I am your Mecra Emergency Agent. I am monitoring your location at "${context.location.address}".

How can I assist you right now?
• If you are in immediate danger, say **"I need help"** or tap the big red SOS button.
• If your vehicle broke down, say **"Vehicle breakdown"**.
• If you need medical guidance, say **"Medical emergency"**.
• To send your live coordinates to a loved one, say **"Share location"**.`,
      timestamp,
      suggestions: [
        'I feel unsafe',
        'Vehicle breakdown',
        'Medical emergency',
        'Share live location',
      ],
    };
  },

  // Web Speech API text-to-speech for audible emergency guidance
  speakInstruction: (text: string): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  },
};
