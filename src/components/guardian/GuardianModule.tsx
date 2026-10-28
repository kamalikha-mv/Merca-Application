import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GuardianJourney } from '../../types';
import {
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Share2,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const GuardianModule: React.FC = () => {
  const { location, contacts, activeJourney, setActiveJourney, triggerEmergency, showToast } =
    useApp();

  const [destination, setDestination] = useState('Home');
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || 'contact-1'
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Countdown timer for active journey
  useEffect(() => {
    if (!activeJourney || activeJourney.status === 'COMPLETED_SAFE') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((activeJourney.expectedArrivalAt - now) / 1000));
      setRemainingSeconds(diffSec);

      // If time expired and not checked in -> Anomaly alert
      if (diffSec === 0 && activeJourney.status === 'ACTIVE') {
        const updated: GuardianJourney = {
          ...activeJourney,
          status: 'ANOMALY_PROMPT',
          timeline: [
            ...activeJourney.timeline,
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              event: 'ETA Expired without Check-in. Anomaly check triggered.',
              type: 'alert',
            },
          ],
        };
        setActiveJourney(updated);
        showToast('⚠️ Guardian Alert: ETA reached! Prompting "Are you safe?" check-in.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney, setActiveJourney, showToast]);

  const handleStartJourney = () => {
    const now = Date.now();
    const journey: GuardianJourney = {
      id: 'journey-' + now,
      startLocation: location.address,
      destination,
      etaMinutes,
      startedAt: now,
      expectedArrivalAt: now + etaMinutes * 60000,
      trustedContactId: selectedContactId,
      status: 'ACTIVE',
      checkInIntervalMinutes: 10,
      lastCheckInAt: now,
      timeline: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Journey started from ${location.address.split(',')[0]} towards ${destination}`,
          type: 'start',
        },
      ],
    };

    setActiveJourney(journey);
    showToast(`Guardian Mode activated: Monitoring route to ${destination} (${etaMinutes}m ETA)`);
  };

  const handleManualCheckIn = () => {
    if (!activeJourney) return;
    const now = Date.now();
    const updated: GuardianJourney = {
      ...activeJourney,
      status: 'ACTIVE',
      lastCheckInAt: now,
      timeline: [
        ...activeJourney.timeline,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: 'Manual Check-in: User confirmed safe on transit.',
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast('✓ Check-in recorded! Guardian monitoring continuing.');
  };

  const handleExtendJourney = (mins: number) => {
    if (!activeJourney) return;
    const updated: GuardianJourney = {
      ...activeJourney,
      expectedArrivalAt: activeJourney.expectedArrivalAt + mins * 60000,
      status: 'ACTIVE',
      timeline: [
        ...activeJourney.timeline,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Journey extended by ${mins} minutes (traffic / delay).`,
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast(`ETA extended by +${mins} minutes`);
  };

  const handleCompleteSafe = () => {
    if (!activeJourney) return;
    const updated: GuardianJourney = {
      ...activeJourney,
      status: 'COMPLETED_SAFE',
    };
    setActiveJourney(null);
    showToast('🎉 Journey ended: Confirmed safely arrived at destination!');
  };

  const handleTriggerMissedSos = () => {
    triggerEmergency('unsafe', 'Guardian Mode missed check-in escalation');
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const guardianContact = contacts.find((c) => c.id === activeJourney?.trustedContactId) || contacts[0];

  return (
    <div className="p-4 space-y-4 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block">
            TRANSIT SAFETY COMPANION
          </span>
          <h2 className="text-xl font-black text-[#0f1d32] m-0">Guardian Mode</h2>
        </div>
        <HonestStatusBadge type="simulation" label="SMART ETA CHECK-IN" />
      </div>

      {!activeJourney ? (
        /* SETUP NEW JOURNEY CARD */
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4">
          <p className="text-xs text-[#5b6b82] leading-relaxed">
            Set your destination, estimated travel time, and a trusted contact. If your check-in is
            missed or unexpected delays occur, Mecra automatically checks if you are safe.
          </p>

          {/* START LOCATION */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Starting From (Live Location)
            </label>
            <div className="p-3 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3] flex items-center gap-2 text-xs font-semibold text-[#0f1d32]">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{location.address}</span>
            </div>
          </div>

          {/* DESTINATION */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1.5">Destination</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Home', 'Office / Campus', 'Metro Station'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDestination(d)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    destination === d
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Or enter custom address..."
              className="w-full p-3 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-[#0f1d32]"
            />
          </div>

          {/* ETA SELECTOR */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1.5">
              Estimated Travel Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setEtaMinutes(m)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    etaMinutes === m
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m} mins
                </button>
              ))}
            </div>
          </div>

          {/* TRUSTED CONTACT PICKER */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1.5">
              Notify Trusted Contact
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full p-3 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-[#0f1d32]"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.relation}) — Priority {c.priority}
                </option>
              ))}
            </select>
          </div>

          {/* START BUTTON */}
          <button
            onClick={handleStartJourney}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Start Guardian Journey</span>
          </button>
        </div>
      ) : (
        /* ACTIVE JOURNEY MONITOR CARD */
        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-4 animate-in fade-in">
          {/* HEADER STATUS */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  JOURNEY IN PROGRESS
                </span>
                <strong className="text-sm font-black text-[#0f1d32]">
                  Heading to {activeJourney.destination}
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block">
                {formatCountdown(remainingSeconds)}
              </span>
              <span className="text-[9px] text-slate-500">remaining</span>
            </div>
          </div>

          {/* ANOMALY ALERT BANNER IF EXPIRED */}
          {activeJourney.status === 'ANOMALY_PROMPT' && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-400 text-rose-950 text-xs space-y-2 animate-bounce">
              <div className="flex items-center gap-2 font-black text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ETA Expired: Are you safe?</span>
              </div>
              <p className="text-[11px] leading-snug">
                Your estimated arrival time has passed. Please tap **I Am Safe** to reset the timer,
                or tap **Emergency Help** to notify {guardianContact?.name}.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleManualCheckIn}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  I am Safe (Reset)
                </button>
                <button
                  onClick={handleTriggerMissedSos}
                  className="py-2 px-3 rounded-xl bg-[#e84e5f] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Trigger SOS
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE DETAILS */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Safety Contact
              </span>
              <span className="font-bold text-[#0f1d32] mt-0.5 block truncate">
                {guardianContact?.name}
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">
                {guardianContact?.phone}
              </span>
            </div>

            <div className="p-3 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Check-in Frequency
              </span>
              <span className="font-bold text-[#0f1d32] mt-0.5 block">Every 10 mins</span>
              <span className="text-[10px] text-blue-600 font-semibold">Active Watch</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualCheckIn}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Check-in Safe</span>
            </button>

            <button
              onClick={() => handleExtendJourney(15)}
              className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+15m</span>
            </button>
          </div>

          {/* TIMELINE */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
              Live Transit Timeline
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {activeJourney.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-[#f8fafd] border border-[#e5ebf3] text-[11px] flex items-center justify-between"
                >
                  <span className="text-[#0f1d32] truncate pr-2 font-medium">{item.event}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* END JOURNEY / ARRIVED */}
          <button
            onClick={handleCompleteSafe}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Have Arrived Safely (End Journey)</span>
          </button>
        </div>
      )}
    </div>
  );
};
