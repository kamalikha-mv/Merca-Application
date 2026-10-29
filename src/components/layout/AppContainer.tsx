import React from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavBar } from './BottomNavBar';
import { ToastContainer } from '../common/ToastContainer';
import { GlobalAiAgentDrawer } from '../chatbot/GlobalAiAgentDrawer';
import { MandatoryLocationGateModal } from '../location/MandatoryLocationGateModal';
import { useApp } from '../../context/AppContext';
import { localDb } from '../../services/storage';

interface AppContainerProps {
  children: React.ReactNode;
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const { location } = useApp();

  // Show mandatory gate only if onboarding was completed but GPS is not authorized/live
  const isLocationGateRequired =
    localDb.isOnboardingComplete() &&
    (!location.isPermissionGranted || !location.isLive || location.lat === 0);

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0f1d32] antialiased selection:bg-[#e84e5f] selection:text-white flex flex-col relative">
      <ToastContainer />

      {/* MANDATORY LOCATION GATE (CANNOT BE DISMISSED OR REJECTED WITHOUT PERMISSION) */}
      <MandatoryLocationGateModal isOpen={isLocationGateRequired} />

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
