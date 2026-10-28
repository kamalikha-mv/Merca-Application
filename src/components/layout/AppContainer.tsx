import React from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavBar } from './BottomNavBar';
import { ToastContainer } from '../common/ToastContainer';
import { GlobalAiAgentDrawer } from '../chatbot/GlobalAiAgentDrawer';

interface AppContainerProps {
  children: React.ReactNode;
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0f1d32] antialiased selection:bg-[#e84e5f] selection:text-white flex flex-col relative">
      <ToastContainer />

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
