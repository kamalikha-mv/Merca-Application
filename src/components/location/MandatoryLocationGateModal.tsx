import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface MandatoryLocationGateModalProps {
  isOpen: boolean;
}

export const MandatoryLocationGateModal: React.FC<MandatoryLocationGateModalProps> = ({ isOpen }) => {
  const { location, isLoadingLocation, refreshLocation } = useApp();
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [hasAttempted, setHasAttempted] = useState(false);

  // Check browser permission status if supported
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => {
            setPermissionState(result.state);
          };
        })
        .catch(() => {});
    }
  }, []);

  // Automatically trigger location detection on modal mount
  useEffect(() => {
    if (isOpen && (!location.isLive || !location.isPermissionGranted)) {
      setHasAttempted(true);
      refreshLocation(false);
    }
  }, [isOpen, location.isLive, location.isPermissionGranted, refreshLocation]);

  if (!isOpen) return null;

  // Once location is fully locked and live, automatically resolve gate
  const isLocked = (location.isLive || location.isPermissionGranted) && location.lat !== 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left relative flex flex-col">
        {/* TOP ACCENT HEADER */}
        <div className="bg-gradient-to-r from-[#0f1d32] to-[#1c3254] text-white p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-[#e84e5f]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#e84e5f] text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
              M
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#e84e5f] uppercase bg-[#e84e5f]/15 px-2 py-0.5 rounded-full inline-block mb-1">
                Mandatory Emergency Calibration
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                High-Precision Location Required
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed relative z-10 mt-1">
            Mecra is an emergency response system. Real-time GPS coordinates are required to dispatch local police, route 108 trauma ambulances, calculate towing recovery distances, and protect you during crises.
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* RADAR PULSE STATUS INDICATOR */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center px-4 relative overflow-hidden">
            <div className="relative mb-3 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isLocked
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-blue-100 text-blue-600 animate-pulse'
                }`}
              >
                {isLocked ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <MapPin className="w-8 h-8 text-blue-600" />
                )}
              </div>
              {!isLocked && (
                <span className="absolute w-20 h-20 rounded-full border-2 border-blue-400/40 animate-ping pointer-events-none" />
              )}
            </div>

            <h3 className="text-sm font-extrabold text-[#0f1d32]">
              {isLocked
                ? 'Location Locked & Verified'
                : isLoadingLocation
                ? 'Acquiring GPS Telemetry...'
                : 'GPS Authorization Needed'}
            </h3>

            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              {isLocked ? (
                <span className="text-emerald-700 font-bold block">
                  {location.address}
                </span>
              ) : isLoadingLocation ? (
                'Requesting coordinates from device sensors and reverse-geocoding district safe hubs...'
              ) : (
                'Please allow location access on your browser prompt to calibrate emergency dispatch.'
              )}
            </p>
          </div>

          {/* PERMISSION DENIED BANNER */}
          {permissionState === 'denied' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <Lock className="w-4 h-4 text-[#e84e5f] shrink-0" />
                <span>Location Access is Blocked in Browser Settings</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed pl-6">
                To allow: Tap the <strong>lock icon 🔒</strong> in your browser's address bar, enable <strong>Location</strong>, and click <strong>Retry Connection</strong> below.
              </p>
            </div>
          )}

          {/* WHY IT CANNOT BE REJECTED EXPLANATION */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>108 / 112 Dispatch:</strong> First responders receive live geo-coordinates instantly upon SOS trigger.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verified Nearby Hubs:</strong> Calibrates distance and live route to nearest police station, hospital, and flatbed tow operator.
              </span>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div>
            <button
              type="button"
              onClick={() => refreshLocation(false)}
              disabled={isLoadingLocation}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isLoadingLocation
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-[#e84e5f] hover:bg-[#d43d4e] active:scale-[0.98] text-white shadow-rose-500/25'
              }`}
            >
              {isLoadingLocation ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Locking Live Coordinates...</span>
                </>
              ) : permissionState === 'denied' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Location Access</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enable Location Access</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
              Location is strictly used on your device for emergency response assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
