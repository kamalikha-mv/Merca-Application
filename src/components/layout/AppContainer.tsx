import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavBar } from './BottomNavBar';
import { ToastContainer } from '../common/ToastContainer';
import { GlobalAiAgentDrawer } from '../chatbot/GlobalAiAgentDrawer';
import { MandatoryLocationGateModal } from '../location/MandatoryLocationGateModal';
import { ReturningUserVerificationModal } from '../profile/ReturningUserVerificationModal';
import { useApp } from '../../context/AppContext';
import { localDb } from '../../services/storage';

interface AppContainerProps {
  children: React.ReactNode;
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const { location, permissionState } = useApp();

  // Show mandatory gate if user completed onboarding but precise GPS permission is not granted or device location is off
  const isLocationGateRequired =
    localDb.isOnboardingComplete() &&
    (!location.isPermissionGranted ||
      !location.isLive ||
      location.lat === 0 ||
      permissionState !== 'granted');

  // Returning user session profile verification (prompt user to verify/update existing details on entry)
  const [isProfileVerificationOpen, setIsProfileVerificationOpen] = useState<boolean>(() => {
    if (!localDb.isOnboardingComplete()) return false;
    try {
      return sessionStorage.getItem('merca_session_profile_verified') !== 'true';
    } catch {
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0f1d32] antialiased selection:bg-[#e84e5f] selection:text-white flex flex-col relative">
      <ToastContainer />

      {/* MANDATORY LOCATION GATE (CANNOT BE DISMISSED OR REJECTED WITHOUT PRECISE GPS PERMISSION) */}
      <MandatoryLocationGateModal isOpen={isLocationGateRequired} />

      {/* RETURNING USER PROFILE VERIFICATION MODAL (VERIFIES SAVED JSON DETAILS ON ENTRY) */}
      <ReturningUserVerificationModal
        isOpen={!isLocationGateRequired && isProfileVerificationOpen}
        onConfirm={() => setIsProfileVerificationOpen(false)}
      />

      {/* TOP HEADER - EDGE TO EDGE */}
      <MobileHeader />

      {/* MAIN CONTENT AREA - RESPONSIVE CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 pb-24 md:pb-12">
        {children}
      </main>

      {/* GLOBAL AI AGENT FLOATING ACTION BUTTON & SLIDING SIDE DRAWER */}
      <GlobalAiAgentDrawer />

      {/* BOTTOM NAV BAR - VISIBLE ON MOBILE / COMPACT DEVICES */}
      <BottomNavBar />
    </div>
  );
};
