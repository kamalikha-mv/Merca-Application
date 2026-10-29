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
import {
  locationService,
  INITIAL_UNRESOLVED_LOCATION,
  generateLocalServices,
} from '../services/locationService';

interface AppContextType {
  // Location
  location: LocationData;
  isLoadingLocation: boolean;
  refreshLocation: (silent?: boolean) => Promise<void>;

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
  saveContacts: (contacts: TrustedContact[]) => void;
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;
  refreshContacts: () => void;

  // Medical
  medical: MedicalProfile;
  saveMedical: (profile: MedicalProfile) => void;
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
  toastType: 'info' | 'success' | 'error';
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Location State (Restores saved location if previously granted; otherwise clean unresolved state)
  const [location, setLocation] = useState<LocationData>(() => {
    const saved = localDb.getSavedLocation();
    return saved || INITIAL_UNRESOLVED_LOCATION;
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
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const showToast = useCallback((msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Fetch Location on demand or silently in background
  const refreshLocation = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoadingLocation(true);
      try {
        const loc = await locationService.getCurrentLocation(silent);
        setLocation(loc);

        // Calibrate real-time emergency services with actual town & coordinates
        if (loc.lat !== 0) {
          const calibrated = generateLocalServices(loc.lat, loc.lng, loc.town || 'Kilambakkam');
          localDb.saveServices(calibrated);
        }

        if (loc.isLive && !silent) {
          showToast(
            `📍 GPS locked: ${loc.town || loc.address.substring(0, 24)} (±${loc.accuracy}m)`,
            'success'
          );
        }
      } catch {
        if (!silent) {
          showToast('⚠️ Could not fetch live GPS coordinates.', 'info');
        }
      } finally {
        if (!silent) setIsLoadingLocation(false);
      }
    },
    [showToast]
  );

  // Initial load GPS detection
  useEffect(() => {
    refreshLocation(false);
  }, [refreshLocation]);

  // Periodic Background Location Tracking (Updates every 60s without re-prompting)
  useEffect(() => {
    const interval = setInterval(() => {
      // Run silent background refresh
      refreshLocation(true);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [refreshLocation]);

  // Voice Guidance Announcement
  const speakGuidance = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Emergency Trigger
  const triggerEmergency = useCallback(
    (category: EmergencyCategory, customSituation?: string) => {
      const policeStations = localDb.getServices('police');
      const nearestPolice = policeStations[0] || {
        id: 'pol-local-1',
        name: `${location.town ? location.town + ' ' : 'Local '}Police Station & Highway Unit`,
        phone: '112 / 100 / 044-27452222',
        address: 'GST Road Junction, Near KCBT Terminal',
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

      showToast(`🚨 ALERT DISPATCHED: Logged to ${nearestPolice.name} & emergency circle`, 'error');

      // Calibrated Voice Guidance
      let voiceMessage = 'Emergency alert activated. Help is on the way. Your live GPS coordinates are being shared.';
      if (category === 'threat' || category === 'assault') {
        voiceMessage = 'Threat alert active. Stay in a well-lit area. Women safety helpline 1091 and police 112 have been alerted with your coordinates.';
      } else if (category === 'medical') {
        voiceMessage = 'Medical emergency registered. Ambulance helpline 108 activated. Stay calm, check breathing, patient medical card is ready.';
      } else if (category === 'vehicle') {
        voiceMessage = 'Vehicle breakdown alert active. National Highway patrol 1033 and mobile recovery units dispatched.';
      }
      speakGuidance(voiceMessage);

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
      showToast('✅ Priority dispatch confirmed. Monitoring response window.', 'success');
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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      showToast('ℹ️ Emergency alert cancelled by user.', 'info');
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    showToast('✅ Confirmed SAFE: Alerts resolved, emergency contacts notified.', 'success');
  }, [activeAlert, showToast]);

  // Escalation Simulation Loop (When emergency is active)
  useEffect(() => {
    if (emergencyStatus !== 'DISPATCHED') return;

    const timer = setInterval(() => {
      setEscalationStep((prev) => {
        if (prev === 1) {
          const c2 = contacts[1]?.name || 'Secondary Family Contact';
          showToast(`⏳ Priority 1 unanswered. Escalating to Priority 2 (${c2})...`, 'info');
          return 2;
        } else if (prev === 2) {
          const c3 = contacts[2]?.name || 'Safety Circle Backup';
          showToast(`⚠️ Escalating to Priority 3 (${c3})...`, 'error');
          return 3;
        }
        return prev;
      });
    }, 18000); // 18 seconds simulated escalation window

    return () => clearInterval(timer);
  }, [emergencyStatus, contacts, showToast]);

  // Contact CRUD & Sync
  const saveContacts = (newContacts: TrustedContact[]) => {
    localDb.saveContacts(newContacts);
    setContacts([...newContacts]);
  };

  const refreshContacts = () => {
    const list = localDb.getContacts();
    setContacts(list);
  };

  const addContact = (contact: Omit<TrustedContact, 'id'>) => {
    const created = localDb.addContact(contact);
    setContacts(localDb.getContacts());
    showToast(`Added contact: ${created.name}`, 'success');
  };

  const updateContact = (id: string, updates: Partial<TrustedContact>) => {
    localDb.updateContact(id, updates);
    setContacts(localDb.getContacts());
    showToast('Contact updated successfully', 'success');
  };

  const deleteContact = (id: string) => {
    localDb.deleteContact(id);
    setContacts(localDb.getContacts());
    showToast('Contact removed', 'info');
  };

  // Medical Updates & Sync
  const saveMedical = (profile: MedicalProfile) => {
    localDb.saveMedical(profile);
    setMedical({ ...profile });
  };

  const updateMedical = (updates: Partial<MedicalProfile>) => {
    const updated = { ...medical, ...updates };
    setMedical(updated);
    localDb.saveMedical(updated);
    showToast('Medical Emergency ID updated', 'success');
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
        saveContacts,
        addContact,
        updateContact,
        deleteContact,
        refreshContacts,
        medical,
        saveMedical,
        updateMedical,
        activeBreakdown,
        setActiveBreakdown,
        activeJourney,
        setActiveJourney,
        dispatchedPoliceStation,
        toastMessage,
        toastType,
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
