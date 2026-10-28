export type EmergencyCategory =
  | 'unsafe'
  | 'medical'
  | 'assault'
  | 'vehicle'
  | 'fire'
  | 'disaster'
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

export type VehicleType = 'Car' | 'Motorcycle' | 'Truck' | 'Scooter' | 'Van';

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
  status: 'ACTIVE' | 'CHECKED_IN' | 'ANOMALY_PROMPT' | 'COMPLETED_SAFE' | 'MISSED_ALERT';
  checkInIntervalMinutes: number;
  lastCheckInAt: number;
  timeline: {
    time: string;
    event: string;
    type: 'start' | 'checkin' | 'alert' | 'complete';
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
  emergencyNotes: string;
  organDonor: boolean;
  primaryLanguage: string;
  allowEmergencyAccess: boolean;
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
    actionType?: 'call' | 'dispatch' | 'map' | 'share';
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
