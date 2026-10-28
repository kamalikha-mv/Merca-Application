import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SosButtonProps {
  onOpenCategories: () => void;
}

export const SosButton: React.FC<SosButtonProps> = ({ onOpenCategories }) => {
  const { emergencyStatus, triggerEmergency, markUserSafe } = useApp();
  const [countdown, setCountdown] = useState<number | null>(null);

  const isEmergency = emergencyStatus === 'DISPATCHED';

  // Handle countdown trigger
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      triggerEmergency('unsafe');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, triggerEmergency]);

  const handleSosClick = () => {
    if (isEmergency) {
      markUserSafe();
    } else {
      // Start 3-second countdown with immediate cancel possibility
      setCountdown(3);
    }
  };

  const handleCancelCountdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCountdown(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-4 py-2">
      {/* GLOWING AMBIENT RADAR RINGS */}
      <div
        className={`absolute w-60 h-60 rounded-full transition-all duration-700 pointer-events-none ${
          isEmergency
            ? 'bg-rose-500/20 sos-pulse'
            : countdown !== null
            ? 'bg-amber-500/25 animate-ping'
            : 'bg-rose-100/60'
        }`}
      />

      <div
        className={`absolute w-72 h-72 rounded-full border transition-all duration-700 pointer-events-none ${
          isEmergency
            ? 'border-rose-400/30'
            : countdown !== null
            ? 'border-amber-400/40'
            : 'border-slate-200/50'
        }`}
      />

      {/* CENTRAL SOS BUTTON */}
      <button
        onClick={handleSosClick}
        aria-label="Emergency SOS Action"
        className={`relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all duration-300 active:scale-95 ${
          isEmergency
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-[7px] border-emerald-100 hover:bg-emerald-600'
            : countdown !== null
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-[7px] border-amber-100 animate-pulse'
            : 'bg-gradient-to-br from-[#e84e5f] to-[#d63b4d] text-white border-[7px] border-rose-100/90 hover:shadow-rose-300 hover:scale-105 btn-red-glow'
        }`}
      >
        {isEmergency ? (
          <>
            <ShieldCheck className="w-8 h-8 mb-1" />
            <span className="text-sm font-black uppercase tracking-wider">I AM SAFE</span>
            <span className="text-[10px] text-emerald-100 font-semibold mt-0.5">
              TAP TO RESOLVE
            </span>
          </>
        ) : countdown !== null ? (
          <>
            <AlertTriangle className="w-7 h-7 mb-1 text-white animate-bounce" />
            <span className="text-2xl font-black">{countdown}</span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-100">
              DISPATCHING...
            </span>
            <span
              onClick={handleCancelCountdown}
              className="mt-1 text-[10px] bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded-full font-bold underline"
            >
              Cancel
            </span>
          </>
        ) : (
          <>
            <Zap className="w-7 h-7 mb-1 fill-white text-white drop-shadow-sm" />
            <span className="text-xl font-black tracking-widest uppercase">SOS</span>
            <span className="text-[10px] font-bold tracking-wider text-rose-100 uppercase mt-0.5">
              EMERGENCY HELP
            </span>
          </>
        )}
      </button>

      {/* HELPER SUBTEXT & CATEGORY TRIGGER */}
      <div className="mt-3 flex items-center gap-2 z-10">
        <button
          onClick={onOpenCategories}
          className="text-xs font-bold text-[#e84e5f] hover:text-[#d33c4d] bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <span>Choose Situation Category</span>
          <span>↓</span>
        </button>
      </div>
    </div>
  );
};
