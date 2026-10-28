import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavBar } from './BottomNavBar';
import { ToastContainer } from '../common/ToastContainer';
import { Smartphone, Monitor } from 'lucide-react';

interface AppContainerProps {
  children: React.ReactNode;
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#0b1524] flex flex-col items-center justify-start text-[#0f1d32] antialiased selection:bg-[#e84e5f] selection:text-white">
      {/* DESKTOP PRESENTATION HEADER BAR */}
      <div className="hidden lg:flex w-full bg-[#101e33] border-b border-slate-800 px-6 py-2.5 items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <strong className="text-white font-bold">Mecra Official Mobile Prototype</strong>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Mobile-First Emergency Response Application</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPhoneFrame
                ? 'bg-[#e84e5f] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device View</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              !isPhoneFrame
                ? 'bg-[#e84e5f] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expanded View</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div
        className={`w-full min-h-screen bg-[#f8fafd] flex flex-col relative transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-md my-0 lg:my-6 lg:rounded-[40px] lg:border-[10px] lg:border-[#16253d] lg:shadow-2xl overflow-hidden'
            : 'max-w-4xl my-0 lg:my-6 lg:rounded-3xl lg:border border-slate-700/60 overflow-hidden shadow-2xl'
        }`}
      >
        <ToastContainer />
        <MobileHeader />

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        <BottomNavBar />
      </div>
    </div>
  );
};
