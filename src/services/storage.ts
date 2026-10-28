import {
  TrustedContact,
  NearbyService,
  SafetyAdvisory,
  MedicalProfile,
  EmergencyAlertRecord,
  VehicleBreakdownRequest,
  GuardianJourney,
} from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'merca_contacts_v1',
  MEDICAL: 'merca_medical_v1',
  SERVICES: 'merca_services_v1',
  ADVISORIES: 'merca_advisories_v1',
  ALERTS_HISTORY: 'merca_alerts_history_v1',
  ACTIVE_BREAKDOWN: 'merca_active_breakdown_v1',
  ACTIVE_JOURNEY: 'merca_active_journey_v1',
  SETTINGS: 'merca_app_settings_v1',
};

// Default Trusted Contacts
export const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'contact-1',
    name: 'Sarah Morgan',
    relation: 'Partner / Spouse',
    phone: '+1 (555) 234-5678',
    priority: 1,
    customTemplate: 'EMERGENCY: I need urgent help! My current live location is attached.',
    simulatedStatus: 'ACKNOWLEDGED',
  },
  {
    id: 'contact-2',
    name: 'David Chen',
    relation: 'Brother / Family',
    phone: '+1 (555) 876-5432',
    priority: 2,
    customTemplate: 'Notice: Mecra alert triggered. Please check in with me.',
    simulatedStatus: 'DELIVERED',
  },
  {
    id: 'contact-3',
    name: 'Elena Rostova',
    relation: 'Close Friend / Roommate',
    phone: '+1 (555) 345-6789',
    priority: 3,
    customTemplate: 'Safety Circle ping: Mecra escalated my emergency status.',
    simulatedStatus: 'PENDING',
  },
];

// Default Medical Profile
export const DEFAULT_MEDICAL: MedicalProfile = {
  fullName: 'Alex Morgan',
  bloodType: 'O+',
  allergies: 'Penicillin, Peanuts',
  medications: 'Asthma Inhaler (Albuterol) as needed',
  emergencyNotes: 'Severe asthma during panic. ICE Contact: Sarah Morgan (+1 555-234-5678).',
  organDonor: true,
  primaryLanguage: 'English',
  allowEmergencyAccess: true,
};

// Rich Pre-Configured Local Places & Services Database
export const DEFAULT_SERVICES: NearbyService[] = [
  // Police Stations
  {
    id: 'pol-1',
    name: 'Metropolitan Central Police Station',
    category: 'police',
    lat: 12.9716,
    lng: 77.5946,
    distanceKm: 0.8,
    address: '42 Civic Center Blvd, Sector 4',
    phone: '100 / 911 / (555) 911-0100',
    rating: 4.8,
    reviewsCount: 342,
    openHours: 'Open 24/7',
    isOpen24x7: true,
    isEmergencyService: true,
    speciality: 'Rapid Response Unit & Victim Assistance Desk',
    verifiedDate: 'Today, Verified by City Safety Registry',
  },
  {
    id: 'pol-2',
    name: 'North District Police Precinct',
    category: 'police',
    lat: 12.9822,
    lng: 77.6033,
    distanceKm: 2.1,
    address: '108 North Parkway, Near Metro Gate 2',
    phone: '(555) 911-0102',
    rating: 4.6,
    reviewsCount: 189,
    openHours: 'Open 24/7',
    isOpen24x7: true,
    isEmergencyService: true,
    speciality: 'Highway Patrol & Women Safety Cell',
    verifiedDate: 'Yesterday, City Police Dept',
  },

  // Hospitals & Emergency Care
  {
    id: 'hosp-1',
    name: 'St. Jude Memorial Trauma & Emergency Hospital',
    category: 'hospital',
    lat: 12.9685,
    lng: 77.5912,
    distanceKm: 1.2,
    address: '15 Health Avenue, Medical District',
    phone: '(555) 443-8000',
    rating: 4.9,
    reviewsCount: 820,
    openHours: 'Emergency Room Open 24/7',
    isOpen24x7: true,
    isEmergencyService: true,
    speciality: 'Level 1 Trauma Center, Cardiac Care, ICU Beds',
    verifiedDate: 'Active 24/7 Verified',
  },
  {
    id: 'hosp-2',
    name: 'CareWell Community Urgent Care',
    category: 'hospital',
    lat: 12.9774,
    lng: 77.5855,
    distanceKm: 1.9,
    address: '77 Commerce Lane, Suite 100',
    phone: '(555) 443-1200',
    rating: 4.5,
    reviewsCount: 310,
    openHours: '07:00 AM – 11:00 PM',
    isOpen24x7: false,
    isEmergencyService: true,
    speciality: 'Minor Injuries, Fracture Care, Burns & X-Ray',
    verifiedDate: 'Today Verified',
  },

  // Pharmacies
  {
    id: 'pharm-1',
    name: 'Apex 24-Hour Emergency Pharmacy',
    category: 'pharmacy',
    lat: 12.9698,
    lng: 77.5928,
    distanceKm: 0.9,
    address: '19 Health Avenue, Opp. Hospital Gate',
    phone: '(555) 321-4567',
    rating: 4.7,
    reviewsCount: 154,
    openHours: 'Open 24/7',
    isOpen24x7: true,
    isEmergencyService: false,
    speciality: 'Inhalers, EpiPens, Oxygen Cans, First Aid Kits',
    verifiedDate: 'Verified Provider',
  },

  // Fire Stations
  {
    id: 'fire-1',
    name: 'City Fire & Disaster Rescue Station 9',
    category: 'fire',
    lat: 12.9755,
    lng: 77.6011,
    distanceKm: 1.5,
    address: '88 Signal Road, Sector 3',
    phone: '101 / (555) 911-0109',
    rating: 4.9,
    reviewsCount: 120,
    openHours: 'Open 24/7 Dispatch',
    isOpen24x7: true,
    isEmergencyService: true,
    speciality: 'Structural Fire, HAZMAT, Vehicle Extraction',
    verifiedDate: 'Verified Emergency Service',
  },

  // Mechanics & Towing
  {
    id: 'mech-1',
    name: 'SpeedyRecovery 24/7 Roadside & Towing',
    category: 'mechanic',
    lat: 12.973,
    lng: 77.598,
    distanceKm: 0.7,
    address: '33 Workshop Row, Old Airport Road',
    phone: '(555) 869-4433',
    rating: 4.8,
    reviewsCount: 275,
    openHours: 'Open 24/7 Mobile Towing',
    isOpen24x7: true,
    isEmergencyService: false,
    speciality: 'Flatbed Towing, Puncture Repair, Jump Start, Battery Replacement',
    verifiedDate: 'Verified Roadside Partner',
  },
  {
    id: 'mech-2',
    name: 'AutoDoc Mobile Mechanic & Diagnostics',
    category: 'mechanic',
    lat: 12.965,
    lng: 77.589,
    distanceKm: 1.8,
    address: '12 Industrial Estate, Bay 4',
    phone: '(555) 869-7711',
    rating: 4.6,
    reviewsCount: 140,
    openHours: '06:00 AM – 10:00 PM',
    isOpen24x7: false,
    isEmergencyService: false,
    speciality: 'Brake Failure, Overheating, Radiator Leakage, Tyre Change',
    verifiedDate: 'Verified Mechanic',
  },

  // Fuel & EV Stations
  {
    id: 'fuel-1',
    name: 'MetroFuel & 150kW EV Supercharger Hub',
    category: 'fuel',
    lat: 12.976,
    lng: 77.593,
    distanceKm: 0.6,
    address: '55 Ring Road Junction',
    phone: '(555) 778-9900',
    rating: 4.6,
    reviewsCount: 420,
    openHours: 'Open 24/7',
    isOpen24x7: true,
    isEmergencyService: false,
    speciality: 'Petrol, Diesel, Fast EV Charging, Tyre Air & Restrooms',
    verifiedDate: 'Open Today',
  },

  // Safe Havens / Public 24/7 Places
  {
    id: 'haven-1',
    name: 'Central Metro Transit Hub & Security Desk',
    category: 'safe_haven',
    lat: 12.974,
    lng: 77.597,
    distanceKm: 0.4,
    address: 'Plaza Entrance, Station Concourse',
    phone: '(555) 555-0199',
    rating: 4.8,
    reviewsCount: 650,
    openHours: 'Open 24/7 with Staff & CCTV',
    isOpen24x7: true,
    isEmergencyService: true,
    speciality: 'Well-lit Public Safe Haven, Guards on Duty, Free Emergency Phone',
    verifiedDate: 'City Public Safety Network',
  },
  {
    id: 'haven-2',
    name: 'NightOwl 24/7 Staffed Diner & Café',
    category: 'food',
    lat: 12.971,
    lng: 77.595,
    distanceKm: 0.5,
    address: '8 Baker Street, Market Square',
    phone: '(555) 234-8899',
    rating: 4.7,
    reviewsCount: 480,
    openHours: 'Open 24/7',
    isOpen24x7: true,
    isEmergencyService: false,
    speciality: 'Well-lit, High Footfall, Safe Waiting Spot',
    verifiedDate: 'Active Community Haven',
  },
];

// Verified Safety Advisories & Community Alerts
export const DEFAULT_ADVISORIES: SafetyAdvisory[] = [
  {
    id: 'adv-1',
    title: 'Flash Flood & Waterlogging Warning on Lower Ring Road',
    type: 'weather',
    severity: 'high',
    description:
      'Heavy sudden rainfall has caused 1.5 ft waterlogging between Underpass 4 and North Junction. Two-wheelers and sedans advised to take Metro Elevated Flyover.',
    source: 'City Disaster Management Authority (CDMA)',
    reportedDate: 'Updated 22 mins ago',
    verified: true,
    locationName: 'Lower Ring Road Underpass',
    distanceKm: 1.4,
  },
  {
    id: 'adv-2',
    title: 'Emergency Road Closure: Utility Pipeline Repair',
    type: 'road_closure',
    severity: 'moderate',
    description:
      'Lane 1 and 2 closed heading westbound on MG Boulevard due to broken water main. Expect 15-20 min delays. Emergency vehicles use Lane 3 bypass.',
    source: 'Municipal Traffic Police Command',
    reportedDate: 'Updated 1 hour ago',
    verified: true,
    locationName: 'MG Boulevard Westbound',
    distanceKm: 2.3,
  },
  {
    id: 'adv-3',
    title: 'Community Hazard Report: Streetlight Outage & Isolated Stretch',
    type: 'community_report',
    severity: 'moderate',
    description:
      'Multiple streetlights off between 4th Cross and Railway Colony back gate. Pedestrians advised to walk via Main Market Boulevard where shops are well-lit.',
    source: 'Verified Resident Watch (#412)',
    reportedDate: 'Reported today, 8:15 PM',
    verified: true,
    locationName: 'Railway Colony Footpath',
    distanceKm: 0.9,
  },
];

// Local JSON Database Helper Class (Simulates REST API with async storage)
export const localDb = {
  // CONTACTS
  getContacts: (): TrustedContact[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : DEFAULT_CONTACTS;
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

  updateContact: (id: string, updates: Partial<TrustedContact>): void => {
    const contacts = localDb.getContacts().map((c) => (c.id === id ? { ...c, ...updates } : c));
    localDb.saveContacts(contacts);
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

  // PURGE ALL DATA (Privacy Requirement)
  clearAllUserData: (): void => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
