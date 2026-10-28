import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LocationData,
  EmergencyCategory,
  EmergencyStatus,
  EmergencyAlertRecord,
  TrustedContact,
  MedicalProfile,
  NearbyService,
  VehicleBreakdownRequest,
  GuardianJourney,
} from '../types';
import { localDb } from '../services/storage';
import { locationService } from '../services/locationService';

interface AppContextType {
  // Location
  location: LocationData;
  isLoadingLocation: boolean;
  refreshLocation: () => Promise<void>;

  // Emergency Management
  emergencyStatus: EmergencyStatus;
  activeAlert: EmergencyAlertRecord | null;
  triggerEmergency: (category: EmergencyCategory, customSituation?: string) => void;
  confirmEmergencyDispatch: () => void;
  cancelEmergency: (reason?: string) => void;
  markUserSafe: () => void;
  escalationStep: number; // 1, 2, 3

  // Contacts
  contacts: TrustedContact[];
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;

  // Medical
  medical: MedicalProfile;
  updateMedical: (profile: Partial<MedicalProfile>) => void;

  // Breakdown Module
  activeBreakdown: VehicleBreakdownRequest | null;
  setActiveBreakdown: (request: VehicleBreakdownRequest | null) => void;

  // Guardian Module
  activeJourney: GuardianJourney | null;
  setActiveJourney: (journey: GuardianJourney | null) => void;

  // Nearby Police Station assigned to current alert
  dispatchedPoliceStation: NearbyService | null;

  // UI Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Location State
  const [location, setLocation] = useState<LocationData>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'Civic Plaza, Central Metro District',
    accuracy: 10,
    timestamp: Date.now(),
    isLive: false,
    isPermissionGranted: false,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Emergency State
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>('IDLE');
  const [activeAlert, setActiveAlert] = useState<EmergencyAlertRecord | null>(null);
  const [escalationStep, setEscalationStep] = useState<number>(1);
  const [dispatchedPoliceStation, setDispatchedPoliceStation] = useState<NearbyService | null>(null);

  // Contacts & Medical
  const [contacts, setContacts] = useState<TrustedContact[]>(() => localDb.getContacts());
  const [medical, setMedical] = useState<MedicalProfile>(() => localDb.getMedical());

  // Breakdown & Guardian
  const [activeBreakdown, setActiveBreakdownState] = useState<VehicleBreakdownRequest | null>(() =>
    localDb.getActiveBreakdown()
  );
  const [activeJourney, setActiveJourneyState] = useState<GuardianJourney | null>(() =>
    localDb.getActiveJourney()
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Fetch Location on initial load
  const refreshLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
      showToast(
        loc.isLive
          ? `📍 Live GPS locked: ${loc.address.substring(0, 32)}...`
          : '📍 Standard GPS simulation locked'
      );
    } catch {
      showToast('⚠️ Could not fetch GPS, using simulated location.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Handle Emergency Trigger
  const triggerEmergency = useCallback(
    (category: EmergencyCategory, customSituation?: string) => {
      const policeStations = localDb.getServices('police');
      const nearestPolice = policeStations[0] || {
        id: 'pol-1',
        name: 'Metropolitan Central Police Station',
        phone: '100 / (555) 911-0100',
        address: '42 Civic Center Blvd',
      };
      setDispatchedPoliceStation(nearestPolice as NearbyService);

      const shareUrl = locationService.generateShareUrl(location, 120);

      const newAlert: EmergencyAlertRecord = {
        id: 'alert-' + Date.now(),
        category,
        title: `EMERGENCY ALERT: ${category.toUpperCase()}`,
        triggeredAt: Date.now(),
        location,
        status: 'DISPATCHED',
        policeStationName: nearestPolice.name,
        policeContact: nearestPolice.phone,
        notifiedContactsCount: contacts.length,
        shareUrl,
        resolutionNote: customSituation,
      };

      setActiveAlert(newAlert);
      setEmergencyStatus('DISPATCHED');
      setEscalationStep(1);
      localDb.saveAlertRecord(newAlert);

      showToast(`🚨 ALERT DISPATCHED: Logged to ${nearestPolice.name}`);

      // Sound and Vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 150, 300, 150, 500]);
      }
    },
    [location, contacts, showToast]
  );

  // Confirm Dispatch
  const confirmEmergencyDispatch = useCallback(() => {
    if (activeAlert) {
      setEmergencyStatus('DISPATCHED');
      showToast('✅ Priority dispatch confirmed. Monitoring response window.');
    }
  }, [activeAlert, showToast]);

  // Cancel Emergency
  const cancelEmergency = useCallback(
    (reason = 'User cancelled request') => {
      if (activeAlert) {
        const updated: EmergencyAlertRecord = {
          ...activeAlert,
          status: 'CANCELLED',
          resolvedAt: Date.now(),
          resolutionNote: reason,
        };
        localDb.saveAlertRecord(updated);
      }
      setEmergencyStatus('CANCELLED');
      setActiveAlert(null);
      setEscalationStep(1);
      showToast('ℹ️ Emergency alert cancelled by user.');
    },
    [activeAlert, showToast]
  );

  // Mark User Safe
  const markUserSafe = useCallback(() => {
    if (activeAlert) {
      const updated: EmergencyAlertRecord = {
        ...activeAlert,
        status: 'RESOLVED_SAFE',
        resolvedAt: Date.now(),
        resolutionNote: 'User confirmed safe status and cancelled escalation.',
      };
      localDb.saveAlertRecord(updated);
    }
    setEmergencyStatus('RESOLVED_SAFE');
    setActiveAlert(null);
    setEscalationStep(1);
    showToast('✅ Confirmed SAFE: Alerts resolved, contacts notified.');
  }, [activeAlert, showToast]);

  // Escalation Simulation Loop (When emergency is active)
  useEffect(() => {
    if (emergencyStatus !== 'DISPATCHED') return;

    const timer = setInterval(() => {
      setEscalationStep((prev) => {
        if (prev === 1) {
          showToast('⏳ Priority 1 unanswered. Escalating to Priority 2 (David Chen)...');
          return 2;
        } else if (prev === 2) {
          showToast('⚠️ Escalating to Priority 3 Safety Circle (Elena Rostova)...');
          return 3;
        }
        return prev;
      });
    }, 18000); // 18 seconds simulated escalation window

    return () => clearInterval(timer);
  }, [emergencyStatus, showToast]);

  // Contact CRUD
  const addContact = (contact: Omit<TrustedContact, 'id'>) => {
    const created = localDb.addContact(contact);
    setContacts(localDb.getContacts());
    showToast(`Added contact: ${created.name}`);
  };

  const updateContact = (id: string, updates: Partial<TrustedContact>) => {
    localDb.updateContact(id, updates);
    setContacts(localDb.getContacts());
    showToast('Contact updated successfully');
  };

  const deleteContact = (id: string) => {
    localDb.deleteContact(id);
    setContacts(localDb.getContacts());
    showToast('Contact removed');
  };

  // Medical Updates
  const updateMedical = (updates: Partial<MedicalProfile>) => {
    const updated = { ...medical, ...updates };
    setMedical(updated);
    localDb.saveMedical(updated);
    showToast('Medical Emergency ID updated');
  };

  // Breakdown wrapper
  const setActiveBreakdown = (req: VehicleBreakdownRequest | null) => {
    localDb.saveActiveBreakdown(req);
    setActiveBreakdownState(req);
  };

  // Journey wrapper
  const setActiveJourney = (journey: GuardianJourney | null) => {
    localDb.saveActiveJourney(journey);
    setActiveJourneyState(journey);
  };

  return (
    <AppContext.Provider
      value={{
        location,
        isLoadingLocation,
        refreshLocation,
        emergencyStatus,
        activeAlert,
        triggerEmergency,
        confirmEmergencyDispatch,
        cancelEmergency,
        markUserSafe,
        escalationStep,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        medical,
        updateMedical,
        activeBreakdown,
        setActiveBreakdown,
        activeJourney,
        setActiveJourney,
        dispatchedPoliceStation,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
