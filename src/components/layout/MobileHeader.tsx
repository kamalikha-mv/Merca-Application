import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, RefreshCw, HeartPulse, AlertTriangle, ShieldAlert, Map, Wrench, Compass, UserCheck, Video } from 'lucide-react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const { location, isLoadingLocation, refreshLocation, emergencyStatus } = useApp();
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const isEmergencyActive = emergencyStatus === 'DISPATCHED';

  const navLinks = [
    { to: '/', label: 'Emergency', icon: ShieldAlert },
    { to: '/map', label: 'Live Map', icon: Map },
    { to: '/breakdown', label: 'Breakdown', icon: Wrench },
    { to: '/guardian', label: 'Guardian', icon: Compass },
    { to: '/evidence', label: 'Evidence', icon: Video },
    { to: '/profile', label: 'Safety & ID', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5ebf3] transition-colors w-full shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* LOGO */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
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
                OFFICIAL
              </span>
            </div>
            <p className="text-[10px] text-[#5b6b82] -mt-0.5 font-medium">Emergency Response Assistant</p>
          </div>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f1f5fb] p-1 rounded-2xl border border-[#e5ebf3]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0f1d32] shadow-xs'
                    : 'text-[#5b6b82] hover:text-[#0f1d32] hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e84e5f]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.to === '/' && isEmergencyActive && (
                  <span className="w-2 h-2 rounded-full bg-[#e84e5f] animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS: GPS LOCATION PILL & MEDICAL SHORTCUT */}
        <div className="flex items-center gap-2">
          {/* GPS LOCATION PILL */}
          <div
            onClick={() => refreshLocation(false)}
            title="Click to refresh real-time GPS"
            className="bg-[#f8fafd] hover:bg-[#f1f5fb] border border-[#e5ebf3] rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                location.isLive ? 'text-emerald-600' : 'text-blue-600'
              }`}
            />
            {location.isLive || location.isPermissionGranted ? (
              <div className="flex flex-col text-left max-w-[110px] sm:max-w-[180px]">
                <span className="text-[11px] font-bold text-[#0f1d32] truncate leading-tight">
                  {location.town || location.address.split(',')[0] || 'Kilambakkam'}
                </span>
                <span className="text-[9px] text-[#627087] truncate leading-none">
                  {location.countryCode || '+91'} • {location.city || 'Chennai Metropolitan Area'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                <span className="text-[11px] font-bold text-slate-700">Acquiring GPS...</span>
              </div>
            )}
            <RefreshCw
              className={`w-3 h-3 text-slate-400 shrink-0 ml-1 ${
                isLoadingLocation ? 'animate-spin text-[#e84e5f]' : ''
              }`}
            />
          </div>

          {/* MOBILE QUICK EVIDENCE CAMERA BUTTON */}
          <button
            onClick={() => navigate('/evidence')}
            title="Open Dedicated Evidence Camera"
            className="md:hidden w-9 h-9 rounded-xl border border-[#e5ebf3] bg-white text-slate-700 hover:text-[#e84e5f] flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <Video className="w-4 h-4 text-purple-600" />
          </button>

          {/* MEDICAL ID / EMERGENCY SHORTCUT */}
          <button
            onClick={() => navigate('/profile')}
            title="Emergency Medical Profile & ICE Card"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs ${
              isEmergencyActive
                ? 'bg-rose-50 border-rose-300 text-[#e84e5f] animate-pulse'
                : 'bg-white border-[#e5ebf3] text-slate-700 hover:text-[#e84e5f] hover:border-rose-200'
            }`}
          >
            {isEmergencyActive ? (
              <AlertTriangle className="w-4 h-4 text-[#e84e5f]" />
            ) : (
              <HeartPulse className="w-4 h-4 text-[#e84e5f]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
