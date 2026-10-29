export type EmergencyCategory =
  | 'unsafe'
  | 'threat'
  | 'medical'
  | 'vehicle'
  | 'assault'
  | 'fire'
  | 'lost'
  | 'general';

export type EmergencyStatus =
  | 'IDLE'
  | 'COUNTDOWN'
  | 'DISPATCHED'
  | 'ESCALATING'
  | 'RESOLVED_SAFE'
  | 'CANCELLED';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  town?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string; // e.g. '+91'
  accuracy: number;
  timestamp: number;
  isLive: boolean;
  isPermissionGranted: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  priority: 1 | 2 | 3;
  customTemplate?: string;
  simulatedStatus?: 'PENDING' | 'DELIVERED' | 'ACKNOWLEDGED' | 'MISSED';
}

export type ServiceCategory =
  | 'police'
  | 'hospital'
  | 'pharmacy'
  | 'ambulance'
  | 'fire'
  | 'mechanic'
  | 'fuel'
  | 'transit'
  | 'food'
  | 'safe_haven';

export interface NearbyService {
  id: string;
  name: string;
  category: ServiceCategory;
  lat: number;
  lng: number;
  distanceKm: number;
  address: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  openHours: string;
  isOpen24x7: boolean;
  isEmergencyService: boolean;
  speciality?: string;
  verifiedDate: string;
}

export type VehicleType = 'Car' | 'Motorcycle' | 'Truck' | 'Scooter' | 'Auto';

export type BreakdownProblem =
  | 'flat_tyre'
  | 'battery_dead'
  | 'engine_overheat'
  | 'empty_fuel'
  | 'towing_needed'
  | 'brake_failure'
  | 'accident_minor'
  | 'locked_out';

export interface VehicleBreakdownRequest {
  id: string;
  vehicleType: VehicleType;
  problem: BreakdownProblem;
  description: string;
  photoUrl?: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED';
  assignedMechanic?: NearbyService;
  requestedAt: number;
  etaMinutes: number;
  location: LocationData;
}

export interface GuardianJourney {
  id: string;
  startLocation: string;
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  etaMinutes: number;
  startedAt: number;
  expectedArrivalAt: number;
  trustedContactId: string;
  escalateContactId?: string;
  status: 'ACTIVE' | 'CHECKED_IN' | 'PAUSED' | 'DELAY_CHECK' | 'ESCALATED' | 'COMPLETED_SAFE' | 'CANCELLED';
  checkInIntervalMinutes: number;
  gracePeriodMinutes?: number;
  pausedUntil?: number;
  isLocationSharingActive: boolean;
  lastCheckInAt: number;
  routeSafetyScore: number; // e.g. 92%
  currentSpeedKmH: number;
  isVehicleHalted: boolean;
  timeline: {
    time: string;
    event: string;
    type: 'start' | 'checkin' | 'alert' | 'complete' | 'speed';
  }[];
}

export interface SafetyAdvisory {
  id: string;
  title: string;
  type: 'weather' | 'hazard' | 'road_closure' | 'official_notice' | 'community_report';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  source: string;
  reportedDate: string;
  verified: boolean;
  locationName: string;
  distanceKm?: number;
}

export interface MedicalProfile {
  fullName: string;
  bloodType: string;
  allergies: string;
  medications: string;
  severeHealthRisks: string;
  emergencyNotes: string;
  organDonor: boolean;
  cityTown: string;
  primaryLanguage: string;
  allowEmergencyAccess: boolean;
}

export interface VideoEvidenceRecord {
  id: string;
  recordedAt: number;
  durationSeconds: number;
  fileBlobUrl: string;
  locationAddress: string;
  coordinates: { lat: number; lng: number };
  sizeMb: number;
  incidentType: string;
}

export interface IncidentPatientCardData {
  incidentId: string;
  timestamp: string;
  fullName: string;
  bloodGroup: string;
  allergies: string;
  healthRisks: string;
  currentMedications: string;
  incidentAddress: string;
  coordinates: string;
  emergencyType: string;
  contacts: { name: string; relation: string; phone: string; priority: number }[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: number;
  suggestions?: string[];
  executedTool?: {
    name: string;
    result: string;
    actionType?: 'call' | 'dispatch' | 'map' | 'share' | 'record' | 'card';
  };
}

export interface EmergencyAlertRecord {
  id: string;
  category: EmergencyCategory;
  title: string;
  triggeredAt: number;
  location: LocationData;
  status: EmergencyStatus;
  policeStationName: string;
  policeContact: string;
  notifiedContactsCount: number;
  shareUrl: string;
  resolvedAt?: number;
  resolutionNote?: string;
}
