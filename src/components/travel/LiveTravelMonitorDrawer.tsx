import React, { useState, useEffect } from 'react';
import { RouteOption, RouteMilestone } from '../../types/travelSafety';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Radio,
  Share2,
  AlertTriangle,
  ShieldAlert,
  Phone,
  CheckCircle2,
  XCircle,
  Navigation,
  Clock,
  Gauge,
  Flame,
} from 'lucide-react';

interface LiveTravelMonitorDrawerProps {
  selectedRoute: RouteOption;
  milestones: RouteMilestone[];
  destinationName: string;
  onEndMonitoring: () => void;
}

export const LiveTravelMonitorDrawer: React.FC<LiveTravelMonitorDrawerProps> = ({
  selectedRoute,
  milestones,
  destinationName,
  onEndMonitoring,
}) => {
  const { location, triggerEmergency, showToast } = useApp();
  const [currentSpeed, setCurrentSpeed] = useState<number>(48);
  const [currentProgressKm, setCurrentProgressKm] = useState<number>(1.2);
  const [isDeviationActive, setIsDeviationActive] = useState<boolean>(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(4);

  // Simulate subtle odometer and speedometer updates
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
      setCurrentProgressKm((prev) =>
        Math.min(selectedRoute.distanceKm, Math.round((prev + 0.3) * 10) / 10)
      );
      setCurrentSpeed(Math.floor(45 + Math.random() * 12));
    }, 15000);

    return () => clearInterval(timer);
  }, [selectedRoute.distanceKm]);

  // Find next upcoming milestone
  const nextMilestone =
    milestones.find((m) => m.distanceFromStartKm > currentProgressKm) ||
    milestones[milestones.length - 1];

  const handleShareJourney = () => {
    const shareText = `🛡️ I am using Mecra Travel Safety Monitoring to travel to ${destinationName} via ${selectedRoute.name}. Current Progress: ${currentProgressKm} km / ${selectedRoute.distanceKm} km.`;
    const shareUrl = `${window.location.origin}/track?route=${selectedRoute.id}&lat=${location.lat}&lng=${location.lng}`;

    if (navigator.share) {
      navigator.share({ title: 'Mecra Safe Journey Live Tracking', text: shareText, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\nLive Tracking: ${shareUrl}`);
      showToast('Live journey tracking link copied to clipboard!', 'success');
    }
  };

  const handleSimulateDeviation = () => {
    setIsDeviationActive((prev) => {
      const next = !prev;
      if (next) {
        showToast(
          '⚠️ Route Deviation Detected! You are 140m off the verified safe highway corridor.',
          'error'
        );
      } else {
        showToast('✅ Back on verified corridor. Route re-locked.', 'success');
      }
      return next;
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#0f1d32] to-[#1c3052] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700 space-y-4 animate-fadeIn">
      {/* TOP LIVE TRACKING HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/40 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Live Safe Travel Monitoring Active
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Corridor telemetry armed • Route: <strong className="text-white">{selectedRoute.name}</strong>
            </p>
          </div>
        </div>

        {/* STATUS PILLS & ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareJourney}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Live Link</span>
          </button>
          <button
            onClick={onEndMonitoring}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
          >
            End Watch
          </button>
        </div>
      </div>

      {/* METRICS HUD: SPEED, PROGRESS, UPCOMING LANDMARK */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Speed
          </span>
          <div className="text-lg font-black text-emerald-400 flex items-center gap-1 mt-0.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>{currentSpeed} km/h</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Distance Covered
          </span>
          <div className="text-lg font-black text-white flex items-center gap-1 mt-0.5">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>
              {currentProgressKm} / {selectedRoute.distanceKm} km
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Elapsed Time
          </span>
          <div className="text-lg font-black text-white flex items-center gap-1 mt-0.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{elapsedMinutes} mins</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Route Lock Status
          </span>
          <div className="text-xs font-black mt-1 flex items-center gap-1">
            {isDeviationActive ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Deviation Alert
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Corridor Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* UPCOMING MILESTONE & CAUTION ADVISORY */}
      <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
            Next Verified Safe Checkpoint
          </span>
          <h4 className="font-extrabold text-white text-sm mt-0.5">{nextMilestone?.title}</h4>
          <p className="text-slate-300 text-[11px] mt-0.5">{nextMilestone?.safetyNote}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nextMilestone?.contactNumber && (
            <a
              href={`tel:${nextMilestone.contactNumber.split('/')[0].trim()}`}
              className="px-3 py-1.5 rounded-xl bg-white text-[#0f1d32] font-black text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3 h-3 text-blue-600" />
              <span>Checkpoint Desk</span>
            </a>
          )}
          <button
            onClick={handleSimulateDeviation}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            title="Simulate route deviation to test guardian warnings"
          >
            {isDeviationActive ? 'Reset Route Lock' : 'Simulate Deviation'}
          </button>
        </div>
      </div>

      {/* DEVIATION ALERT WARNING IF ACTIVE */}
      {isDeviationActive && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-black text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Off-Corridor Warning: Departure from Primary Recommended Highway</span>
          </div>
          <p className="text-[11px] leading-relaxed pl-6">
            Mecra detects your trajectory has left the 6-lane GST Highway. If this is an involuntary diversion or breakdown, your designated ICE contacts and highway police can be alerted instantly.
          </p>
          <div className="pl-6 pt-1 flex items-center gap-2">
            <button
              onClick={() => triggerEmergency('unsafe', 'Route deviation off verified highway')}
              className="px-3 py-1.5 rounded-xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white font-black text-xs cursor-pointer shadow-md"
            >
              Alert Contacts (Trigger SOS)
            </button>
            <button
              onClick={handleSimulateDeviation}
              className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs cursor-pointer"
            >
              I am Safe (Intentional Stop)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
