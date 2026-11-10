export interface RouteOption {
  id: string;
  name: string;
  type: 'recommended' | 'fastest' | 'shortest' | 'alternative';
  distanceKm: number;
  durationMinutes: number;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  trafficDelayMinutes: number;
  roadQuality: 'excellent' | 'good' | 'fair';
  safetyScore: number; // 0 to 100
  recommendedReason: string;
  hazardsSummary: string[];
  coordinates: [number, number][];
  tollPlazasCount: number;
  lightingPercentage: number;
  policeCoverageScore: string;
  cctvSurveillance: 'High' | 'Moderate' | 'Limited';
}

export interface RouteMilestone {
  id: string;
  distanceFromStartKm: number;
  title: string;
  type: 'start' | 'transit' | 'fuel' | 'hospital' | 'police' | 'hazard' | 'amenity' | 'destination';
  safetyNote?: string;
  contactNumber?: string;
  openHours?: string;
  lat: number;
  lng: number;
}

export interface CrimeStatInfo {
  score: number; // out of 10
  level: 'Low' | 'Moderate' | 'High';
  description: string;
  historicalIncidentsCount: number;
  lastReportedDate: string;
  patrolFrequency: string;
}

export interface AccidentBlackspot {
  id: string;
  locationName: string;
  kmMarker: string;
  riskFactor: string;
  advisory: string;
  severity: 'moderate' | 'high';
}

export interface RoadClosureInfo {
  id: string;
  stretch: string;
  reason: string;
  alternateAdvice: string;
  verifiedBy: string;
  status: 'active' | 'partial';
}

export interface ConstructionZone {
  id: string;
  stretch: string;
  speedLimitKmH: number;
  expectedDelay: string;
  contractor: string;
}

export interface FloodProneArea {
  id: string;
  areaName: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  currentStatus: string;
  monsoonVulnerability: string;
}

export interface WeatherWarningInfo {
  condition: string;
  temperatureCelsius: number;
  visibilityKm: number;
  alertText: string;
  rainProbability: number;
  windSpeedKmH: number;
}

export interface OfficialSafetyAlert {
  id: string;
  agency: string;
  message: string;
  timestamp: string;
  urgency: 'normal' | 'advisory' | 'critical';
}

export interface IsolatedRouteSection {
  id: string;
  startKm: number;
  endKm: number;
  description: string;
  lighting: 'Poor' | 'Moderate' | 'Adequate';
  emergencyPhoneAvailable: boolean;
  recommendedAction: string;
}

export interface SafetyAnalytics {
  overallRiskLevel: 'Low' | 'Moderate' | 'Elevated';
  crimeStats: CrimeStatInfo;
  accidentBlackspots: AccidentBlackspot[];
  roadClosures: RoadClosureInfo[];
  constructionZones: ConstructionZone[];
  floodProneAreas: FloodProneArea[];
  weather: WeatherWarningInfo;
  officialAlerts: OfficialSafetyAlert[];
  isolatedSections: IsolatedRouteSection[];
}

export type PlaceCategory =
  | 'police'
  | 'hospital'
  | 'pharmacy'
  | 'ambulance'
  | 'railway'
  | 'bus'
  | 'fuel'
  | 'mechanic'
  | 'restaurant'
  | 'hotel'
  | 'public_place';

export interface NearbyRoutePlace {
  id: string;
  name: string;
  category: PlaceCategory;
  distanceKm: number;
  address: string;
  phone?: string;
  openHours: string;
  rating: number;
  reviewsCount?: number;
  lat: number;
  lng: number;
  directionsUrl: string;
  is24x7?: boolean;
}

export interface PersonalisationPreferences {
  ageGroup?: '18-24' | '25-45' | '46-60' | '60+';
  gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';
  travelParty?: 'solo' | 'family_with_kids' | 'group';
  modeOfTransport?: 'car_taxi' | 'two_wheeler' | 'public_bus' | 'metro_train' | 'walking';
  timeOfDay?: 'day' | 'dusk_night' | 'late_night';
  accessibilityRequirements?: string[];
  personalPreferences?: string[];
}

export interface LiveTravelMonitoringState {
  isActive: boolean;
  startedAt: number;
  currentKm: number;
  currentSpeedKmH: number;
  routeDeviationDetected: boolean;
  batteryStatusPct?: number;
  lastCheckpointPassed: string;
  nextMilestone: string;
  nextMilestoneDistanceKm: number;
  lastUpdated: string;
}

export interface TravelReport {
  id: string;
  startLocationName: string;
  startCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  generatedAt: number;
  lastUpdatedSource: string;
  routes: RouteOption[];
  selectedRouteId: string;
  milestones: RouteMilestone[];
  safety: SafetyAnalytics;
  nearbyPlaces: NearbyRoutePlace[];
  personalisation?: PersonalisationPreferences;
  liveMonitoring: LiveTravelMonitoringState;
}
