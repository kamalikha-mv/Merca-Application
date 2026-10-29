import {
  TrustedContact,
  NearbyService,
  SafetyAdvisory,
  MedicalProfile,
  EmergencyAlertRecord,
  VehicleBreakdownRequest,
  GuardianJourney,
  VideoEvidenceRecord,
  IncidentPatientCardData,
  LocationData,
} from '../types';
import { generateLocalServices } from './locationService';

const STORAGE_KEYS = {
  ONBOARDING_STATUS: 'merca_onboarding_v1',
  CONTACTS: 'merca_contacts_v1',
  MEDICAL: 'merca_medical_v1',
  SERVICES: 'merca_services_v1',
  ADVISORIES: 'merca_advisories_v1',
  ALERTS_HISTORY: 'merca_alerts_history_v1',
  ACTIVE_BREAKDOWN: 'merca_active_breakdown_v1',
  ACTIVE_JOURNEY: 'merca_active_journey_v1',
  SETTINGS: 'merca_app_settings_v1',
  EVIDENCE: 'merca_video_evidence_v1',
  INCIDENT_CARDS: 'merca_incident_cards_v1',
  SAVED_LOCATION: 'merca_saved_location_v1',
  GUARDIAN_SETTINGS: 'merca_guardian_settings_v1',
};

// Default Trusted Contacts (starts empty - user must configure their own real contacts)
export const DEFAULT_CONTACTS: TrustedContact[] = [];

// Default Medical Profile (starts empty with no fake preloaded personal details)
export const DEFAULT_MEDICAL: MedicalProfile = {
  fullName: '',
  bloodType: '',
  allergies: '',
  medications: '',
  severeHealthRisks: '',
  emergencyNotes: '',
  organDonor: false,
  cityTown: '',
  primaryLanguage: '',
  allowEmergencyAccess: true,
};

// Default Local Services (Regional Corridor base)
export const DEFAULT_SERVICES: NearbyService[] = generateLocalServices(12.8718, 80.0815, 'Regional Corridor');

// Default Safety Advisories
export const DEFAULT_ADVISORIES: SafetyAdvisory[] = [
  {
    id: 'adv-1',
    title: 'Central Highway & Transit Corridor Advisory',
    type: 'road_closure',
    severity: 'moderate',
    description: 'Heavy passenger density around highway overpass ramp. High-visibility police patrol stationed at Terminal gate.',
    source: 'Regional Traffic Police Advisory',
    reportedDate: 'Updated 20 mins ago',
    verified: true,
    locationName: 'National Highway Corridor',
    distanceKm: 0.6,
  },
  {
    id: 'adv-2',
    title: 'Heavy Rain / Monsoon Waterlogging Watch',
    type: 'weather',
    severity: 'moderate',
    description: 'Intermittent heavy rain expected across highway transit corridor. Emergency recovery vans on standby.',
    source: 'Regional Meteorological Centre',
    reportedDate: 'Today, 08:30 AM',
    verified: true,
    locationName: 'Highway Transit Sector',
    distanceKm: 2.4,
  },
  {
    id: 'adv-3',
    title: 'Women Safe Transit Corridor Active',
    type: 'official_notice',
    severity: 'low',
    description: 'Pink Patrol vehicle safe bay and 24/7 CCTV surveillance operational at Transit concourse.',
    source: 'District Women & Child Safety Cell',
    reportedDate: 'Active Standing Advisory',
    verified: true,
    locationName: 'Transit Concourse Sector',
    distanceKm: 0.4,
  },
  {
    id: 'adv-4',
    title: 'Highway 24/7 Breakdown & Towing Patrol',
    type: 'official_notice',
    severity: 'low',
    description: 'NHAI Emergency patrol 1033 active along GST Road. Free crane and jumpstart assistance available.',
    source: 'NHAI Highway Operations',
    reportedDate: 'Standing 24/7 Service',
    verified: true,
    locationName: 'NH 45 Toll Gateway Corridor',
    distanceKm: 1.1,
  },
];

export const localDb = {
  // ONBOARDING STATUS
  isOnboardingComplete: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS) === 'true';
    } catch {
      return false;
    }
  },

  setOnboardingComplete: (val: boolean): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, val ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage write error', e);
    }
  },

  // CONTACTS
  getContacts: (): TrustedContact[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  },

  saveContacts: (contacts: TrustedContact[]): void => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },

  addContact: (contact: Omit<TrustedContact, 'id'>): TrustedContact => {
    const contacts = localDb.getContacts();
    const newContact: TrustedContact = {
      ...contact,
      id: 'contact-' + Date.now(),
      simulatedStatus: 'PENDING',
    };
    contacts.push(newContact);
    localDb.saveContacts(contacts);
    return newContact;
  },

  updateContact: (id: string, updates: Partial<TrustedContact>): TrustedContact | null => {
    const contacts = localDb.getContacts();
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    contacts[idx] = { ...contacts[idx], ...updates };
    localDb.saveContacts(contacts);
    return contacts[idx];
  },

  deleteContact: (id: string): void => {
    const contacts = localDb.getContacts().filter((c) => c.id !== id);
    localDb.saveContacts(contacts);
  },

  // MEDICAL
  getMedical: (): MedicalProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICAL);
      return data ? JSON.parse(data) : DEFAULT_MEDICAL;
    } catch {
      return DEFAULT_MEDICAL;
    }
  },

  saveMedical: (profile: MedicalProfile): void => {
    localStorage.setItem(STORAGE_KEYS.MEDICAL, JSON.stringify(profile));
  },

  // SERVICES
  getServices: (category?: string): NearbyService[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      const list: NearbyService[] = data ? JSON.parse(data) : DEFAULT_SERVICES;
      if (!category || category === 'all') return list;
      return list.filter((s) => s.category === category);
    } catch {
      return DEFAULT_SERVICES;
    }
  },

  saveServices: (services: NearbyService[]): void => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  // ADVISORIES
  getAdvisories: (): SafetyAdvisory[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVISORIES);
      return data ? JSON.parse(data) : DEFAULT_ADVISORIES;
    } catch {
      return DEFAULT_ADVISORIES;
    }
  },

  addAdvisory: (advisory: Omit<SafetyAdvisory, 'id' | 'reportedDate'>): SafetyAdvisory => {
    const list = localDb.getAdvisories();
    const newAdv: SafetyAdvisory = {
      ...advisory,
      id: 'adv-' + Date.now(),
      reportedDate: 'Just now (Community Report)',
    };
    list.unshift(newAdv);
    localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(list));
    return newAdv;
  },

  // EMERGENCY ALERTS HISTORY
  getAlertsHistory: (): EmergencyAlertRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAlertRecord: (record: EmergencyAlertRecord): void => {
    const list = localDb.getAlertsHistory();
    const existingIdx = list.findIndex((r) => r.id === record.id);
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.ALERTS_HISTORY, JSON.stringify(list.slice(0, 50)));
  },

  // BREAKDOWN REQUEST
  getActiveBreakdown: (): VehicleBreakdownRequest | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_BREAKDOWN);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveBreakdown: (request: VehicleBreakdownRequest | null): void => {
    if (request) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BREAKDOWN, JSON.stringify(request));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_BREAKDOWN);
    }
  },

  // GUARDIAN JOURNEY
  getActiveJourney: (): GuardianJourney | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_JOURNEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveJourney: (journey: GuardianJourney | null): void => {
    if (journey) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JOURNEY, JSON.stringify(journey));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_JOURNEY);
    }
  },

  // VIDEO & AUDIO EVIDENCE
  getEvidenceRecords: (): VideoEvidenceRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveEvidenceRecord: (rec: VideoEvidenceRecord): void => {
    const list = localDb.getEvidenceRecords();
    list.unshift(rec);
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(list.slice(0, 20)));
  },

  deleteEvidenceRecord: (id: string): void => {
    const list = localDb.getEvidenceRecords().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(list));
  },

  // INCIDENT PATIENT CARDS
  getIncidentCards: (): IncidentPatientCardData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENT_CARDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveIncidentCard: (card: IncidentPatientCardData): void => {
    const list = localDb.getIncidentCards();
    const existingIdx = list.findIndex((c) => c.incidentId === card.incidentId);
    if (existingIdx >= 0) {
      list[existingIdx] = card;
    } else {
      list.unshift(card);
    }
    localStorage.setItem(STORAGE_KEYS.INCIDENT_CARDS, JSON.stringify(list.slice(0, 20)));
  },

  // SAVED LOCATION
  getSavedLocation: (): LocationData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLocation: (loc: LocationData): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOCATION, JSON.stringify(loc));
    } catch (e) {
      console.warn('Storage location write error', e);
    }
  },

  // GUARDIAN CONFIGURATION
  getGuardianSettings: (): { gracePeriodMinutes: number; escalateContactId: string } => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUARDIAN_SETTINGS);
      return data ? JSON.parse(data) : { gracePeriodMinutes: 3, escalateContactId: '' };
    } catch {
      return { gracePeriodMinutes: 3, escalateContactId: '' };
    }
  },

  saveGuardianSettings: (settings: { gracePeriodMinutes: number; escalateContactId: string }): void => {
    localStorage.setItem(STORAGE_KEYS.GUARDIAN_SETTINGS, JSON.stringify(settings));
  },

  // PURGE ALL DATA (Privacy Requirement)
  clearAllUserData: (): void => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
