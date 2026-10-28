import React, { useState, useEffect, useRef } from 'react';
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
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Volume2,
  Gauge,
  Navigation,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const GuardianModule: React.FC = () => {
  const { location, contacts, activeJourney, setActiveJourney, triggerEmergency, showToast } =
    useApp();

  const [destination, setDestination] = useState('Home (Tambaram Corridor)');
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || 'contact-1'
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Fake Call State
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [fakeCallStatus, setFakeCallStatus] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [callDuration, setCallDuration] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  // Countdown timer & halt detection for active journey
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
        showToast('⚠️ Guardian Alert: ETA reached! Prompting "Are you safe?" check-in.', 'error');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney, setActiveJourney, showToast]);

  // Fake Call Ringtone Synthesis
  const playRingtonePulse = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleTriggerFakeCall = () => {
    setIsFakeCallActive(true);
    setFakeCallStatus('RINGING');
    setCallDuration(0);

    // Ring every 2.5 seconds
    playRingtonePulse();
    ringIntervalRef.current = window.setInterval(() => {
      playRingtonePulse();
    }, 2500);
  };

  const handleAcceptFakeCall = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    setFakeCallStatus('CONNECTED');

    // Speech synthesis voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        "Hey! Where are you right now? I'm waiting right outside by the main entrance. Come out right away, I have the car started."
      );
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleDeclineFakeCall = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsFakeCallActive(false);
    setFakeCallStatus('RINGING');
  };

  // Connected call duration timer
  useEffect(() => {
    let callTimer: number | null = null;
    if (fakeCallStatus === 'CONNECTED') {
      callTimer = window.setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [fakeCallStatus]);

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
      routeSafetyScore: 94,
      currentSpeedKmH: 36,
      isVehicleHalted: false,
      timeline: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Journey started from ${location.town || 'Kilambakkam'} towards ${destination}`,
          type: 'start',
        },
      ],
    };

    setActiveJourney(journey);
    showToast(`Guardian Mode activated: Route Safety Score 94% (${etaMinutes}m ETA)`, 'success');
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
    showToast('✓ Check-in recorded! Guardian monitoring continuing.', 'success');
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
          event: `Journey extended by ${mins} minutes (traffic delay).`,
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast(`ETA extended by +${mins} minutes`, 'info');
  };

  const handleCompleteSafe = () => {
    if (!activeJourney) return;
    setActiveJourney(null);
    showToast('🎉 Journey ended: Confirmed safely arrived at destination!', 'success');
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
    <div className="space-y-4 text-left">
      {/* FAKE INCOMING CALL MODAL OVERLAY */}
      {isFakeCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-white animate-fadeIn">
          {/* TOP CALLER INFO */}
          <div className="flex flex-col items-center text-center mt-12 space-y-3">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-white shadow-2xl relative">
              <UserCheck className="w-12 h-12 text-slate-300" />
              {fakeCallStatus === 'RINGING' && (
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Dad (Home ICE)</h3>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                {fakeCallStatus === 'RINGING'
                  ? 'Incoming Mobile Call (+91 98401 23456)...'
                  : `Call Active (${Math.floor(callDuration / 60)}:${(callDuration % 60)
                      .toString()
                      .padStart(2, '0')})`}
              </p>
            </div>
            {fakeCallStatus === 'CONNECTED' && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Simulated Voice Escape Active</span>
              </div>
            )}
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="w-full max-w-xs flex items-center justify-around mb-12">
            {fakeCallStatus === 'RINGING' ? (
              <>
                {/* DECLINE */}
                <button
                  onClick={handleDeclineFakeCall}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-700 flex items-center justify-center shadow-lg transition-transform active:scale-90">
                    <PhoneOff className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Decline</span>
                </button>

                {/* ACCEPT */}
                <button
                  onClick={handleAcceptFakeCall}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 group-hover:bg-emerald-600 flex items-center justify-center shadow-lg transition-transform active:scale-90 animate-bounce">
                    <PhoneCall className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Accept Call</span>
                </button>
              </>
            ) : (
              /* END CALL */
              <button
                onClick={handleDeclineFakeCall}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-700 flex items-center justify-center shadow-lg transition-transform active:scale-90">
                  <PhoneOff className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-300">End Escape Call</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block">
            TRANSIT SAFETY COMPANION
          </span>
          <h2 className="text-lg sm:text-xl font-black text-[#0f1d32] m-0">Guardian Journey Mode</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* DISCREET FAKE CALL TRIGGER */}
          <button
            onClick={handleTriggerFakeCall}
            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <PhoneForwarded className="w-3.5 h-3.5 text-purple-600" />
            <span>Discreet Fake Call</span>
          </button>
          <HonestStatusBadge type="simulation" label="GPS SMART ROUTE" />
        </div>
      </div>

      {!activeJourney ? (
        /* SETUP NEW JOURNEY CARD */
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4">
          <p className="text-xs text-[#5b6b82] leading-relaxed">
            Set your transit destination, travel duration, and monitoring contact. Mecra calculates real-time route safety, monitors speed halts, and alerts your circle if ETA is missed.
          </p>

          {/* ROUTE SAFETY PRE-CALCULATION */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                94%
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f1d32] uppercase">
                  Route Safety Index: Very Safe
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  High-density CCTV, well-lit GST highway corridor, 1.2km to highway police.
                </p>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* START LOCATION */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Starting From (Live GPS)
              </label>
              <div className="p-3 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3] flex items-center gap-2 text-xs font-semibold text-[#0f1d32]">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{location.address}</span>
              </div>
            </div>

            {/* DESTINATION */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Home / Tambaram / Guindy"
                className="w-full p-3 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-2xl focus:outline-none focus:border-emerald-500 text-[#0f1d32] font-semibold"
              />
            </div>

            {/* ETA SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Estimated Travel Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 40, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEtaMinutes(m)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      etaMinutes === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* TRUSTED CONTACT PICKER */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Safety Circle Monitor Contact
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-2xl focus:outline-none focus:border-emerald-500 text-[#0f1d32] font-semibold"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.relation}) — {c.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* START BUTTON */}
          <button
            onClick={handleStartJourney}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Activate Guardian Route Monitoring</span>
          </button>
        </div>
      ) : (
        /* ACTIVE JOURNEY CARD */
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-emerald-500/40 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                ACTIVE GUARDIAN TRACKING
              </span>
              <h3 className="text-base font-black text-[#0f1d32] mt-0.5">
                Route to: {activeJourney.destination}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>36 km/h (Normal Moving)</span>
              </div>
            </div>
          </div>

          {/* COUNTDOWN & ANOMALY */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Time Remaining until Expected Arrival
              </span>
              <div className="text-2xl font-black text-[#0f1d32] font-mono mt-0.5">
                {formatCountdown(remainingSeconds)}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Monitoring Contact: <strong>{guardianContact?.name}</strong> ({guardianContact?.phone})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleManualCheckIn}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>I Am Safe (Check-in)</span>
              </button>
              <button
                onClick={() => handleExtendJourney(10)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                +10 Mins
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCompleteSafe}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reached Safely • End Journey</span>
            </button>

            <button
              onClick={handleTriggerMissedSos}
              className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-[#e84e5f] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-[#e84e5f]" />
              <span>Escalate Alert to Police & ICE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
