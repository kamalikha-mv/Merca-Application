import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, RefreshCw, HeartPulse, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const { location, isLoadingLocation, refreshLocation, emergencyStatus } = useApp();
  const navigate = useNavigate();

  const isEmergencyActive = emergencyStatus === 'DISPATCHED';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5ebf3] px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* LOGO */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[#0f1d32] tracking-wider uppercase">
                MECRA
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-50 text-[#e84e5f]">
                APP
              </span>
            </div>
            <p className="text-[10px] text-[#5b6b82] -mt-0.5 font-medium">Emergency Response</p>
          </div>
        </div>

        {/* GPS LOCATION PILL */}
        <div
          onClick={() => refreshLocation()}
          title="Click to refresh GPS"
          className="flex-1 max-w-[170px] bg-[#f8fafd] hover:bg-slate-100 border border-[#e5ebf3] rounded-full px-2.5 py-1 flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <MapPin
            className={`w-3.5 h-3.5 shrink-0 ${
              location.isLive ? 'text-emerald-600' : 'text-blue-600'
            }`}
          />
          <span className="text-[11px] font-semibold text-[#0f1d32] truncate">
            {location.address.split(',')[0]}
          </span>
          <RefreshCw
            className={`w-3 h-3 text-slate-400 shrink-0 ml-auto ${
              isLoadingLocation ? 'animate-spin text-blue-600' : ''
            }`}
          />
        </div>

        {/* MEDICAL ID / EMERGENCY SHORTCUT */}
        <button
          onClick={() => navigate('/profile')}
          title="Emergency Medical Profile"
          className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
            isEmergencyActive
              ? 'bg-rose-50 border-rose-200 text-[#e84e5f] animate-pulse'
              : 'bg-[#f8fafd] border-[#e5ebf3] text-slate-700 hover:text-rose-600'
          }`}
        >
          {isEmergencyActive ? (
            <AlertTriangle className="w-4 h-4 text-[#e84e5f]" />
          ) : (
            <HeartPulse className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
