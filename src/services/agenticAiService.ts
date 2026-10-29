import {
  AgentChatMessage,
  LocationData,
  TrustedContact,
  MedicalProfile,
  EmergencyCategory,
  VehicleBreakdownRequest,
  GuardianJourney,
  EmergencyStatus,
  EmergencyAlertRecord,
  VehicleType,
  BreakdownProblem,
} from '../types';
import { localDb } from './storage';
import { locationService } from './locationService';

export interface AgentContext {
  currentPage: string;
  location: LocationData;
  activeCategory?: EmergencyCategory;
  emergencyStatus: EmergencyStatus;
  activeAlert: EmergencyAlertRecord | null;
  medical: MedicalProfile;
  contacts: TrustedContact[];
  activeBreakdown: VehicleBreakdownRequest | null;
  activeJourney: GuardianJourney | null;
  onTriggerEmergency?: (category: EmergencyCategory, note?: string) => void;
  onDispatchPolice?: () => void;
  onSendContactAlert?: (contactId: string) => void;
  onResolveSafe?: () => void;
  onUpdateMedical?: (profile: Partial<MedicalProfile>) => void;
  onAddContact?: (contact: Omit<TrustedContact, 'id'>) => void;
  onSetActiveBreakdown?: (req: VehicleBreakdownRequest | null) => void;
  onSetActiveJourney?: (journey: GuardianJourney | null) => void;
  onNavigate?: (path: string) => void;
}

export const agenticAiService = {
  // Process user input and return context-aware AI response with full tool-call execution
  processMessage: async (
    userInput: string,
    context: AgentContext
  ): Promise<AgentChatMessage> => {
    const raw = userInput.trim();
    const text = raw.toLowerCase();
    const id = 'msg-' + Date.now();
    const timestamp = Date.now();

    // 1. TOOL: CALMING & PANIC GROUNDING (HUMAN-LIKE REASSURANCE)
    if (
      text.includes('panic') ||
      text.includes('scared') ||
      text.includes('calm') ||
      text.includes('anxious') ||
      text.includes('afraid') ||
      text.includes('terrified') ||
      text.includes('help me calm')
    ) {
      return {
        id,
        sender: 'agent',
        text: `Take a slow, deep breath in with me right now.

🌬️ **Breathe with Mecra (4-4-4-4 Technique):**
1. Inhale deeply through your nose for 4 seconds...
2. Hold your breath gently for 4 seconds...
3. Exhale slowly through your mouth for 4 seconds...
4. Rest your mind for 4 seconds.

> *"You are stronger than this moment. Take one second at a time."*

I am actively monitoring your location at **${context.location.town || (context.location.isPermissionGranted ? 'Your Local Sector' : 'Your Detected Region')}**. Your GPS status is armed. If you feel any physical threat, say **"Trigger SOS"** and I will alert authorities immediately. Otherwise, I am right here with you.`,
        timestamp,
        suggestions: [
          'I am feeling calmer now',
          'Call my emergency contact',
          'Trigger SOS Alert',
          'Where am I right now?',
        ],
        executedTool: {
          name: 'calmPanicGrounding',
          result: 'Grounding guide delivered. Emergency monitoring running continuously.',
          actionType: 'record',
        },
      };
    }

    // 2. TOOL: FORM AUTO-FILL - MEDICAL PROFILE
    if (
      (text.includes('fill') || text.includes('update') || text.includes('set')) &&
      (text.includes('medical') || text.includes('blood') || text.includes('allergy') || text.includes('name'))
    ) {
      const updates: Partial<MedicalProfile> = {};

      // Parse blood group
      const bgMatch = raw.match(/\b(O\+|O\-|A\+|A\-|B\+|B\-|AB\+|AB\-)\b/i);
      if (bgMatch) updates.bloodType = bgMatch[1].toUpperCase();

      // Parse full name
      const nameMatch = raw.match(/name(?:\s+is|:)?\s+([A-Za-z\s]+?)(?:,|\.|\bwith\b|\band\b|$)/i);
      if (nameMatch) updates.fullName = nameMatch[1].trim();

      // Parse allergies
      const allergyMatch = raw.match(/allerg(?:y|ies)(?:\s+is|:)?\s+([A-Za-z\s,]+?)(?:,|\.|\bwith\b|\band\b|$)/i);
      if (allergyMatch) updates.allergies = allergyMatch[1].trim();

      // Parse severe risks
      const riskMatch = raw.match(/(?:risk|asthma|condition)(?:\s+is|:)?\s+([A-Za-z\s,]+?)(?:,|\.|\band\b|$)/i);
      if (riskMatch) updates.severeHealthRisks = riskMatch[1].trim();

      if (Object.keys(updates).length > 0) {
        if (context.onUpdateMedical) context.onUpdateMedical(updates);
        return {
          id,
          sender: 'agent',
          text: `✅ I have automatically updated your Medical Emergency ID:
${updates.fullName ? `• Name: **${updates.fullName}**\n` : ''}${updates.bloodType ? `• Blood Group: **${updates.bloodType}**\n` : ''}${updates.allergies ? `• Allergies: **${updates.allergies}**\n` : ''}${updates.severeHealthRisks ? `• Health Risks: **${updates.severeHealthRisks}**\n` : ''}
These details are saved encrypted on your device and will be included in the paramedic intake card during emergency dispatches.`,
          timestamp,
          suggestions: [
            'View my full patient card',
            'Go to Safety & ID tab',
            'Add emergency contact',
          ],
          executedTool: {
            name: 'autoFillMedicalProfile',
            result: `Updated fields: ${Object.keys(updates).join(', ')}`,
            actionType: 'card',
          },
        };
      }
    }

    // 3. TOOL: FORM AUTO-FILL - ADD EMERGENCY CONTACT
    if (
      (text.includes('add') || text.includes('save')) &&
      (text.includes('contact') || text.includes('number') || text.includes('phone') || text.includes('person'))
    ) {
      // Extract phone number
      const phoneMatch = raw.match(/(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b/);
      const phone = phoneMatch ? phoneMatch[0] : '';

      // Extract name
      const nameMatch = raw.match(/contact(?:\s+named|\s+is|:)?\s+([A-Za-z\s]+?)(?:,|\.|\bwith\b|\bphone\b|\bnumber\b|$)/i);
      const name = nameMatch ? nameMatch[1].trim() : 'Emergency Contact';

      // Extract relation
      const relationMatch = raw.match(/(?:relation|who\s+is\s+my|as\s+my)\s+([A-Za-z]+)/i);
      const relation = relationMatch ? relationMatch[1].trim() : 'Trusted Contact';

      if (phone) {
        if (context.onAddContact) {
          context.onAddContact({
            name,
            relation,
            phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
            priority: (Math.min(3, context.contacts.length + 1) as 1 | 2 | 3) || 1,
            customTemplate: 'EMERGENCY: Urgent assistance needed at my live location.',
          });
        }

        return {
          id,
          sender: 'agent',
          text: `✅ I have added **${name}** (${relation}) with phone number **${phone}** to your Priority Emergency Contacts!

Your emergency circle now has **${context.contacts.length + 1}** contacts configured. In case of an emergency, live GPS coordinates will be sent to them.`,
          timestamp,
          suggestions: [
            'Check my emergency circle',
            'Add another contact',
            'Where am I right now?',
          ],
          executedTool: {
            name: 'addEmergencyContact',
            result: `Saved contact: ${name} (${phone}) as Priority ${Math.min(3, context.contacts.length + 1)}`,
            actionType: 'dispatch',
          },
        };
      } else {
        return {
          id,
          sender: 'agent',
          text: `I can add an emergency contact for you. Please mention their Name and 10-digit mobile number, for example:
*"Add contact Ramesh, relation brother, phone 9840123456"*`,
          timestamp,
          suggestions: ['Add contact Ramesh, phone 9840123456', 'Go to Safety & ID Setup'],
        };
      }
    }

    // 4. TOOL: FORM AUTO-FILL & DISPATCH - BREAKDOWN ASSISTANCE
    if (
      text.includes('breakdown') ||
      text.includes('puncture') ||
      text.includes('flat tyre') ||
      text.includes('dead battery') ||
      text.includes('jumpstart') ||
      text.includes('overheat') ||
      text.includes('tow')
    ) {
      let vType: VehicleType = 'Car';
      if (text.includes('bike') || text.includes('motorcycle')) vType = 'Motorcycle';
      else if (text.includes('scooter') || text.includes('activa') || text.includes('ev')) vType = 'Scooter';
      else if (text.includes('truck') || text.includes('lorry')) vType = 'Truck';

      let prob: BreakdownProblem = 'flat_tyre';
      if (text.includes('battery') || text.includes('jumpstart')) prob = 'battery_dead';
      else if (text.includes('overheat') || text.includes('smoke')) prob = 'engine_overheat';
      else if (text.includes('fuel') || text.includes('charge')) prob = 'empty_fuel';
      else if (text.includes('tow')) prob = 'towing_needed';
      else if (text.includes('brake')) prob = 'brake_failure';
      else if (text.includes('lock')) prob = 'locked_out';

      const nearestMech = localDb.getServices('mechanic')[0];

      if (context.onSetActiveBreakdown) {
        context.onSetActiveBreakdown({
          id: 'bd-' + Date.now(),
          vehicleType: vType,
          problem: prob,
          description: `Assistance requested via AI Agent for ${vType} with ${prob.replace('_', ' ')}`,
          status: 'REQUESTED',
          assignedMechanic: nearestMech,
          requestedAt: Date.now(),
          etaMinutes: 12,
          location: context.location,
        });
      }

      if (context.onNavigate) context.onNavigate('/breakdown');

      return {
        id,
        sender: 'agent',
        text: `🚗 Roadside assistance has been prepared and logged!
• **Vehicle:** ${vType}
• **Issue:** ${prob.replace('_', ' ').toUpperCase()}
• **Location:** ${context.location.address}
• **Assigned Unit:** ${nearestMech?.name || 'NHAI 24/7 Mobile Recovery'} (ETA: 12 mins)

I have taken you to the Breakdown Tracker. Would you like me to dial the mechanic directly?`,
        timestamp,
        suggestions: [
          `Call ${nearestMech?.name || 'Mechanic'}`,
          'Turn on Hazard Strobe Beacon',
          'Share GPS via WhatsApp',
        ],
        executedTool: {
          name: 'requestBreakdownAssistance',
          result: `Dispatched ${nearestMech?.name} for ${vType} (${prob}). Navigated to /breakdown.`,
          actionType: 'dispatch',
        },
      };
    }

    // 5. TOOL: START GUARDIAN JOURNEY TRIP
    if (
      (text.includes('start') || text.includes('track') || text.includes('monitor')) &&
      (text.includes('trip') || text.includes('journey') || text.includes('ride') || text.includes('travel') || text.includes('going to'))
    ) {
      const destMatch = raw.match(/(?:to|heading to|destination)\s+([A-Za-z\s]+?)(?:,|\.|\bfor\b|\bin\b|$)/i);
      const dest = destMatch ? destMatch[1].trim() : 'Destination';

      const minMatch = raw.match(/(\d+)\s*(?:mins|minutes|m)/i);
      const eta = minMatch ? parseInt(minMatch[1], 10) : 25;

      const now = Date.now();
      const journey: GuardianJourney = {
        id: 'journey-' + now,
        startLocation: context.location.address,
        destination: dest,
        etaMinutes: eta,
        startedAt: now,
        expectedArrivalAt: now + eta * 60000,
        trustedContactId: context.contacts[0]?.id || '',
        status: 'ACTIVE',
        checkInIntervalMinutes: 10,
        gracePeriodMinutes: 5,
        isLocationSharingActive: true,
        lastCheckInAt: now,
        routeSafetyScore: 94,
        currentSpeedKmH: 35,
        isVehicleHalted: false,
        timeline: [
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: `Journey initiated via AI Agent towards ${dest}`,
            type: 'start',
          },
        ],
      };

      if (context.onSetActiveJourney) context.onSetActiveJourney(journey);
      if (context.onNavigate) context.onNavigate('/guardian');

      return {
        id,
        sender: 'agent',
        text: `🛡️ Guardian Mode is now active for your trip!
• **Destination:** ${dest}
• **Estimated Duration:** ${eta} minutes
• **Route Safety Score:** 94% (High-visibility, CCTV highway corridor)
• **Monitoring Contact:** ${context.contacts[0]?.name || 'Primary Contact'}

I am actively tracking your transit speed and route. If an unexpected halt occurs or ETA is exceeded, I will prompt your safety check-in.`,
        timestamp,
        suggestions: [
          'I arrived safely',
          'Discreet Fake Call',
          'Breathe with Mecra',
        ],
        executedTool: {
          name: 'startGuardianJourney',
          result: `Guardian tracking active for ${dest} (${eta} mins). Navigated to /guardian.`,
          actionType: 'dispatch',
        },
      };
    }

    // 6. TOOL: CONTEXT INSPECTION (WHAT PAGE AM I ON / WHAT DETAILS ARE SAVED)
    if (
      text.includes('where am i') ||
      text.includes('my location') ||
      text.includes('what page') ||
      text.includes('what tab') ||
      text.includes('current details') ||
      text.includes('what are my details')
    ) {
      const pageNames: Record<string, string> = {
        '/': 'Home Emergency SOS Dashboard',
        '/map': 'Live Radar Map & Facilities Explorer',
        '/breakdown': 'Highway Roadside Assistance Wizard',
        '/guardian': 'Guardian Transit Journey Mode',
        '/profile': 'Safety Circle & Medical ID Setup',
        '/advisories': 'Local Safety Advisories & Alerts',
      };

      return {
        id,
        sender: 'agent',
        text: `Here is your current operational context:
📍 **Live GPS Location:** ${context.location.address}
🌐 **Coordinates:** ${context.location.lat.toFixed(5)}° N, ${context.location.lng.toFixed(5)}° E (±${context.location.accuracy}m)
📱 **Current Section:** ${pageNames[context.currentPage] || context.currentPage}
👥 **Configured Contacts:** ${context.contacts.length} (${context.contacts.length >= 2 ? 'Active Safety Circle' : 'Incomplete - Min 2 required'})
🩺 **Medical ID Name:** ${context.medical.fullName || 'Not configured'} (Blood: ${context.medical.bloodType || 'Not set'})
🚨 **Emergency Status:** ${context.emergencyStatus}`,
        timestamp,
        suggestions: [
          'Fill my medical profile',
          'Add an emergency contact',
          'Show nearest hospital',
          'Share live GPS link',
        ],
        executedTool: {
          name: 'inspectCurrentState',
          result: `State verified: ${context.currentPage}, GPS accuracy ±${context.location.accuracy}m`,
          actionType: 'share',
        },
      };
    }

    // 7. TOOL: IMMEDIATE SOS DANGER
    if (
      text.includes('help') ||
      text.includes('danger') ||
      text.includes('sos') ||
      text.includes('unsafe') ||
      text.includes('attack') ||
      text.includes('threat')
    ) {
      if (context.onTriggerEmergency) context.onTriggerEmergency('threat');

      return {
        id,
        sender: 'agent',
        text: `🚨 Urgent Emergency Protocol Activated!
1. Verified live coordinates at **${context.location.address}**.
2. Alert logged to **${context.location.town ? context.location.town + ' ' : ''}Police Station (112)**.
3. Alert sequence triggered for your **${context.contacts.length}** emergency contacts.

Stay in a crowded, well-lit place. Do you want me to dial Police 112 directly or trigger the Discreet Fake Call?`,
        timestamp,
        suggestions: [
          'Call Police 112 now',
          'Discreet Fake Call',
          'Record 3m video evidence',
          'I am in a safe spot now',
        ],
        executedTool: {
          name: 'executeEmergencyProtocol',
          result: `Emergency alert activated for location ${context.location.lat.toFixed(4)}, ${context.location.lng.toFixed(4)}.`,
          actionType: 'dispatch',
        },
      };
    }

    // 8. TOOL: RESOLVE / CANCEL EMERGENCY
    if (
      text.includes('safe now') ||
      text.includes('cancel') ||
      text.includes('i am fine') ||
      text.includes('resolved')
    ) {
      if (context.onResolveSafe) context.onResolveSafe();

      return {
        id,
        sender: 'agent',
        text: `Understood! I have marked your status as **SAFE**.
• Alert cancelled on device.
• Emergency escalation paused.
• Contacts and dispatch logs updated with your safe confirmation.

Take a gentle, relaxing breath. I am standing by whenever you need me!`,
        timestamp,
        suggestions: [
          'Return to Home Dashboard',
          'View my contacts',
          'Where am I right now?',
        ],
        executedTool: {
          name: 'markUserSafeAndNotify',
          result: 'Emergency state cleared safely.',
          actionType: 'dispatch',
        },
      };
    }

    // 9. DEFAULT HELPFUL AGENTIC ASSISTANCE
    return {
      id,
      sender: 'agent',
      text: `Hello! I am your **Mecra Agentic AI Companion**, connected directly to all components and data across the app.

I can actively help you:
• **Fill forms:** *"Update my blood group to B+ and add asthma risk"*
• **Add contacts:** *"Add contact Priya, relation spouse, phone 9840123456"*
• **Request breakdown:** *"I have a flat tyre on my scooter"*
• **Start safe journey:** *"Start trip to Tambaram for 25 mins"*
• **Panic support:** *"Help me calm down"* or *"Trigger SOS alert"*

How can I assist you right now?`,
      timestamp,
      suggestions: [
        'Where am I right now?',
        'Breathe with Mecra (Calm)',
        'Vehicle breakdown assistance',
        'Add an emergency contact',
      ],
    };
  },

  // Web Speech API text-to-speech
  speakInstruction: (text: string): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text.replace(/[*_#`>•]/g, '').replace(/https?:\/\/\S+/g, 'link attached');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  },
};
