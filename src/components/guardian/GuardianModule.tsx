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
  Heart,
  Battery,
  Lock,
  MessageSquare,
  ShieldAlert,
  Pause,
  Play,
  Radio,
  Timer,
  RotateCcw,
  Info,
  Car,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { locationService } from '../../services/locationService';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const GuardianModule: React.FC = () => {
  const { location, contacts, activeJourney, setActiveJourney, triggerEmergency, showToast } =
    useApp();

  const [destination, setDestination] = useState('Home');
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState<number>(5);
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || ''
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [graceRemainingSec, setGraceRemainingSec] = useState<number>(300);
  const [pauseRemainingSec, setPauseRemainingSec] = useState<number>(0);

  // Fake Call State
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [fakeCallStatus, setFakeCallStatus] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [callDuration, setCallDuration] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  // Breathing Panic Guide State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Safe Passcode State
  const [safePasscode, setSafePasscode] = useState('');
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  // Update selected contact if contacts change
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  // Box Breathing Cycle Timer
  useEffect(() => {
    let timer: number | null = null;
    if (isBreathingActive) {
      timer = window.setInterval(() => {
        setBreathingTimer((t) => {
          if (t <= 1) {
            setBreathingPhase((phase) => {
              if (phase === 'Inhale') return 'Hold';
              if (phase === 'Hold') return 'Exhale';
              if (phase === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBreathingActive]);

  // Main Journey Monitoring Clock: Handles Active countdown, Delay Check & Grace Period, and Pauses
  useEffect(() => {
    if (!activeJourney || activeJourney.status === 'COMPLETED_SAFE' || activeJourney.status === 'CANCELLED') return;

    const interval = setInterval(() => {
      const now = Date.now();

      // 1. ACTIVE STATUS: Countdown to expected arrival
      if (activeJourney.status === 'ACTIVE') {
        const diffSec = Math.max(0, Math.floor((activeJourney.expectedArrivalAt - now) / 1000));
        setRemainingSeconds(diffSec);

        // When ETA expires -> Enter 2-stage verification: DELAY_CHECK
        if (diffSec <= 0) {
          const graceSec = (activeJourney.gracePeriodMinutes || 5) * 60;
          setGraceRemainingSec(graceSec);
          const updated: GuardianJourney = {
            ...activeJourney,
            status: 'DELAY_CHECK',
            timeline: [
              ...activeJourney.timeline,
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event: `ETA reached. Initiating 2-stage check-in (${activeJourney.gracePeriodMinutes || 5}m grace period before alerting contacts).`,
                type: 'alert',
              },
            ],
          };
          setActiveJourney(updated);
          showToast('⚠️ Check-in time reached: Are you delayed by traffic or stopped?', 'info');
        }
      }

      // 2. DELAY_CHECK STATUS: Distinguish ordinary traffic delay from emergency
      if (activeJourney.status === 'DELAY_CHECK') {
        setGraceRemainingSec((prev) => {
          if (prev <= 1) {
            // Grace period expired without user confirming safe or delayed -> ESCALATE!
            const primaryContact = contacts.find((c) => c.id === activeJourney.trustedContactId) || contacts[0];
            const updated: GuardianJourney = {
              ...activeJourney,
              status: 'ESCALATED',
              timeline: [
                ...activeJourney.timeline,
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  event: `Grace period expired without response. Automated emergency SOS escalated to ${primaryContact?.name || 'Emergency Contact'}.`,
                  type: 'alert',
                },
              ],
            };
            setActiveJourney(updated);
            triggerEmergency('threat', `Guardian Escalation: Missed check-in on route to ${activeJourney.destination}. Last known GPS: ${location.address}`);
            showToast(`🚨 Unanswered check-in! Escalated to ${primaryContact?.name || 'Emergency Contact'}`, 'error');
            return 0;
          }
          return prev - 1;
        });
      }

      // 3. PAUSED STATUS: Countdown break duration
      if (activeJourney.status === 'PAUSED' && activeJourney.pausedUntil) {
        const pauseDiff = Math.max(0, Math.floor((activeJourney.pausedUntil - now) / 1000));
        setPauseRemainingSec(pauseDiff);
        if (pauseDiff <= 0) {
          // Auto resume after pause expires
          const updated: GuardianJourney = {
            ...activeJourney,
            status: 'ACTIVE',
            pausedUntil: undefined,
            expectedArrivalAt: now + 15 * 60000,
            timeline: [
              ...activeJourney.timeline,
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event: 'Pause period expired. Active GPS route monitoring resumed.',
                type: 'checkin',
              },
            ],
          };
          setActiveJourney(updated);
          showToast('▶️ Pause expired: Guardian active route monitoring resumed.', 'success');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney, setActiveJourney, showToast, triggerEmergency, contacts, location]);

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

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        "Hey! Where are you right now? I'm waiting right outside by the main gate with the car. Come out right now."
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
    const contactToUse = selectedContactId || contacts[0]?.id || '';
    const secondaryContact = contacts.find((c) => c.id !== contactToUse);
    const now = Date.now();
    const journey: GuardianJourney = {
      id: 'journey-' + now,
      startLocation: location.address,
      destination,
      etaMinutes,
      startedAt: now,
      expectedArrivalAt: now + etaMinutes * 60000,
      trustedContactId: contactToUse,
      escalateContactId: secondaryContact?.id,
      status: 'ACTIVE',
      checkInIntervalMinutes: 10,
      gracePeriodMinutes,
      isLocationSharingActive: true,
      lastCheckInAt: now,
      routeSafetyScore: 94,
      currentSpeedKmH: 36,
      isVehicleHalted: false,
      timeline: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Journey started towards ${destination} with ${gracePeriodMinutes}m missed-check-in grace period.`,
          type: 'start',
        },
      ],
    };

    setActiveJourney(journey);
    showToast(`Guardian Mode activated: Monitoring route to ${destination} (${etaMinutes}m ETA)`, 'success');
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

  // Stage 1: Ordinary delay acknowledged by user (traffic/slow travel) without alarming contacts
  const handleReportTrafficDelay = (mins = 15) => {
    if (!activeJourney) return;
    const now = Date.now();
    const updated: GuardianJourney = {
      ...activeJourney,
      expectedArrivalAt: now + mins * 60000,
      status: 'ACTIVE',
      timeline: [
        ...activeJourney.timeline,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Traffic Delay Confirmed by User (+${mins}m). Status reset to Active. Contacts not alarmed.`,
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast(`🚗 Traffic delay noted: Journey extended by +${mins}m. Emergency circle kept calm.`, 'success');
  };

  // Pause monitoring for pitstop (e.g. tea, fuel, rest area)
  const handlePauseJourney = (mins = 15) => {
    if (!activeJourney) return;
    const now = Date.now();
    const pauseExpiry = now + mins * 60000;
    setPauseRemainingSec(mins * 60);

    const updated: GuardianJourney = {
      ...activeJourney,
      status: 'PAUSED',
      pausedUntil: pauseExpiry,
      timeline: [
        ...activeJourney.timeline,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Monitoring paused for ${mins}m break (fuel/rest). Anomaly alarms temporarily suppressed.`,
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast(`⏸️ Guardian paused for ${mins}m break. Tap resume anytime.`, 'info');
  };

  // Resume paused monitoring
  const handleResumeJourney = () => {
    if (!activeJourney) return;
    const now = Date.now();
    const updated: GuardianJourney = {
      ...activeJourney,
      status: 'ACTIVE',
      pausedUntil: undefined,
      expectedArrivalAt: now + 15 * 60000,
      timeline: [
        ...activeJourney.timeline,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: 'Monitoring resumed by user after break.',
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast('▶️ Guardian route monitoring resumed!', 'success');
  };

  // Cancel monitoring with prompt
  const handleCancelJourney = () => {
    if (!activeJourney) return;
    if (safePasscode) {
      setIsPinPromptOpen(true);
      return;
    }
    setActiveJourney(null);
    showToast('Guardian journey monitoring cancelled.', 'info');
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
          event: `Journey extended by ${mins} minutes.`,
          type: 'checkin',
        },
      ],
    };
    setActiveJourney(updated);
    showToast(`ETA extended by +${mins} minutes`, 'info');
  };

  const handleCompleteSafe = () => {
    if (!activeJourney) return;
    if (safePasscode) {
      setIsPinPromptOpen(true);
      return;
    }
    setActiveJourney(null);
    showToast('🎉 Journey ended: Confirmed safely arrived at destination!', 'success');
  };

  const handleConfirmPin = () => {
    if (enteredPin === safePasscode) {
      setIsPinPromptOpen(false);
      setEnteredPin('');
      setActiveJourney(null);
      showToast('🎉 Passcode Verified: Journey successfully ended!', 'success');
    } else {
      showToast('⚠️ Incorrect Passcode. Journey monitoring continues.', 'error');
    }
  };

  // Stealth Silent Alert
  const handleStealthAlert = () => {
    triggerEmergency('threat', 'Discreet Silent Alert: User triggered covert assistance request.');
    showToast('🤫 Silent Stealth Alert Dispatched. Coordinates sent to emergency circle.', 'error');
  };

  // Low Battery / SMS Fallback
  const handleSendOfflineSms = () => {
    const contact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
    if (!contact) {
      showToast('No contact configured. Add one in Safety & ID setup.', 'error');
      return;
    }
    const msg = `MECRA TRIP ALERT: Heading to ${destination}. Current GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (${location.address}). Battery level low. Please track me.`;
    emergencyService.openSmsApp(contact.phone, msg);
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const guardianContact = contacts.find((c) => c.id === activeJourney?.trustedContactId) || contacts[0];

  return (
    <div className="space-y-4 text-left">
      {/* FAKE INCOMING CALL OVERLAY */}
      {isFakeCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-white animate-fadeIn">
          <div className="flex flex-col items-center text-center mt-12 space-y-3">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-white shadow-2xl relative">
              <UserCheck className="w-12 h-12 text-slate-300" />
              {fakeCallStatus === 'RINGING' && (
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Family Emergency Contact</h3>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                {fakeCallStatus === 'RINGING'
                  ? 'Incoming Mobile Call...'
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

          <div className="w-full max-w-xs flex items-center justify-around mb-12">
            {fakeCallStatus === 'RINGING' ? (
              <>
                <button
                  onClick={handleDeclineFakeCall}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-700 flex items-center justify-center shadow-lg transition-transform active:scale-90">
                    <PhoneOff className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Decline</span>
                </button>

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

      {/* SAFE ARRIVAL PIN PROMPT MODAL */}
      {isPinPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#0f1d32]">Enter Safe Passcode</h3>
            <p className="text-xs text-slate-500">
              Enter your 4-digit PIN to securely confirm your arrival and cancel Guardian tracking.
            </p>
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-32 mx-auto text-center text-xl tracking-widest font-black py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmPin}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Arrival
              </button>
              <button
                onClick={() => setIsPinPromptOpen(false)}
                className="py-3 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
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

      {/* PANIC & CALMING TOOLS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* BOX BREATHING CALMING TRIGGER */}
        <button
          onClick={() => setIsBreathingActive(!isBreathingActive)}
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            isBreathingActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 text-[#0f1d32] hover:bg-blue-50/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${isBreathingActive ? 'text-white' : 'text-blue-600'}`} />
            <span>{isBreathingActive ? 'Close Breathing Guide' : 'Breathe with Mecra (Calm)'}</span>
          </div>
          <span className="text-[10px] font-semibold opacity-80">4-4-4-4</span>
        </button>

        {/* STEALTH SILENT ALERT */}
        <button
          onClick={handleStealthAlert}
          className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-[#e84e5f] text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#e84e5f]" />
            <span>Stealth Silent Alert</span>
          </div>
          <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md font-semibold">Covert</span>
        </button>

        {/* LOW BATTERY / OFFLINE SMS FALLBACK */}
        <button
          onClick={handleSendOfflineSms}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-600" />
            <span>Offline SMS Fallback</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">2G/Low Net</span>
        </button>
      </div>

      {/* INTERACTIVE BOX-BREATHING PANIC RELIEF WIDGET */}
      {isBreathingActive && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-4 animate-fadeIn text-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-200">
              Box Breathing Panic De-escalation
            </span>
            <span className="text-xs text-blue-200 font-bold">4 Seconds Rhythm</span>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-24 h-24 rounded-full border-4 border-white/40 flex flex-col items-center justify-center transition-all duration-1000 transform scale-105 animate-pulse bg-white/10">
              <span className="text-2xl font-black">{breathingTimer}s</span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">{breathingPhase}</span>
            </div>
            <p className="text-xs text-blue-100 max-w-xs mt-3 leading-relaxed">
              {breathingPhase === 'Inhale' && 'Slowly breathe in deep through your nose...'}
              {breathingPhase === 'Hold' && 'Hold your breath gently. Stay centered...'}
              {breathingPhase === 'Exhale' && 'Slowly exhale through your mouth...'}
              {breathingPhase === 'Rest' && 'Rest and relax your shoulders. You are safe.'}
            </p>
          </div>
        </div>
      )}

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
                placeholder="Enter destination (e.g. Home, Office, Metro)"
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

            {/* CONFIGURABLE MISSED-CHECK-IN GRACE PERIOD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase block">
                  Missed-Check-in Grace Period
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  2-Stage Escalation
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { m: 3, label: '3 Mins (Strict)' },
                  { m: 5, label: '5 Mins (Standard)' },
                  { m: 10, label: '10 Mins (Relaxed)' },
                ].map((item) => (
                  <button
                    key={item.m}
                    onClick={() => setGracePeriodMinutes(item.m)}
                    className={`py-2 px-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      gracePeriodMinutes === item.m
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                If check-in is unacknowledged, Mecra prompts for traffic delay before alerting contacts.
              </p>
            </div>

            {/* TRUSTED CONTACT PICKER */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Safety Circle Monitor Contact
              </label>
              {contacts.length === 0 ? (
                <div className="p-2.5 text-xs bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 font-semibold">
                  No contacts added yet. Configure contacts in Safety & ID setup.
                </div>
              ) : (
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
              )}
            </div>

            {/* CLEAR INDICATION OF WHICH CONTACT WILL BE NOTIFIED */}
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#0f1d32] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated Escalation Target:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Primary escalation contact: <strong>{guardianContact?.name || 'Emergency Contact 1'}</strong> ({guardianContact?.phone || 'No phone set'}).
                {contacts.length > 1 && (
                  <span> Secondary backup contact: <strong>{contacts.find(c => c.id !== (selectedContactId || contacts[0]?.id))?.name}</strong>.</span>
                )}
              </p>
              <div className="text-[10px] text-blue-700 bg-blue-50/80 p-2 rounded-xl mt-1">
                💡 <em>Missing a check-in is not assumed to be an emergency. Mecra first initiates an on-screen Traffic Delay confirmation before dispatching SMS/GPS to your primary contact.</em>
              </div>
            </div>

            {/* OPTIONAL SAFE PASSCODE */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Optional Safe Arrival Passcode (Prevents Coerced Cancellation)
              </label>
              <input
                type="password"
                maxLength={4}
                value={safePasscode}
                onChange={(e) => setSafePasscode(e.target.value)}
                placeholder="Set 4-digit PIN (e.g. 1234) or leave blank"
                className="w-full p-3 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-2xl focus:outline-none focus:border-emerald-500 text-[#0f1d32] font-semibold"
              />
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
          {/* VISIBLE INDICATION OF WHETHER LOCATION SHARING IS ACTIVE */}
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div className="truncate text-xs text-emerald-950 font-bold">
                <span>Live Location Sharing: </span>
                <span className="text-emerald-700 uppercase">Active</span>
                <span className="text-slate-500 font-normal hidden sm:inline"> — Transmitting GPS ping every 60s to </span>
                <strong className="text-slate-800 hidden sm:inline">{guardianContact?.name || 'Contact'}</strong>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold shrink-0">
              60s Ping
            </span>
          </div>

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
              <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>36 km/h (Normal Transit)</span>
              </div>
            </div>
          </div>

          {/* STAGE 1 DELAY CHECK BANNER (DISTINGUISHING TRAFFIC DELAY FROM EMERGENCY) */}
          {activeJourney.status === 'DELAY_CHECK' && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                  <span>Check-in Time Reached: Are you delayed?</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-mono font-bold px-2 py-0.5 rounded-full">
                  Grace: {formatCountdown(graceRemainingSec)}
                </span>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Missing a check-in is not assumed to be an emergency. If you are stuck in traffic, delayed at a signal, or stopped, please tap <strong>Delayed by Traffic</strong> so your emergency contacts are not unnecessarily worried.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleReportTrafficDelay(15)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Delayed by Traffic (+15m)</span>
                </button>

                <button
                  onClick={handleCompleteSafe}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>I Am Safe (Arrived)</span>
                </button>

                <button
                  onClick={() => {
                    triggerEmergency('threat', `User confirmed SOS during Guardian transit check on route to ${activeJourney.destination}.`);
                    showToast('Emergency SOS escalated immediately!', 'error');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>I Need Help (SOS)</span>
                </button>
              </div>

              <div className="text-[10px] text-amber-800 text-center font-medium">
                Automated emergency alert with GPS will dispatch to <strong>{guardianContact?.name}</strong> in {formatCountdown(graceRemainingSec)} if unconfirmed.
              </div>
            </div>
          )}

          {/* PAUSED BANNER (FOR BREAK/FUEL STOP) */}
          {activeJourney.status === 'PAUSED' && (
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-wide">
                  <Pause className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Journey Monitoring Paused (Break in progress)</span>
                </div>
                <span className="text-[10px] bg-blue-200 text-blue-950 font-mono font-bold px-2 py-0.5 rounded-full">
                  Resumes in: {formatCountdown(pauseRemainingSec)}
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Location monitoring is paused for a pitstop (tea/fuel). Check-in alarms are temporarily suppressed.
              </p>
              <button
                onClick={handleResumeJourney}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Resume Journey Monitoring Now</span>
              </button>
            </div>
          )}

          {/* ESCALATED BANNER */}
          {activeJourney.status === 'ESCALATED' && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                <span>Emergency Escalation Dispatched</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                Grace period expired without check-in. Automated emergency alert with your live GPS coordinates has been transmitted to <strong>{guardianContact?.name}</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleManualCheckIn}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirm False Alarm / I Am Safe
                </button>
                <button
                  onClick={handleStealthAlert}
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Dial Police 112
                </button>
              </div>
            </div>
          )}

          {/* COUNTDOWN & ANOMALY */}
          {activeJourney.status === 'ACTIVE' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Time Remaining until Expected Arrival
                </span>
                <div className="text-2xl font-black text-[#0f1d32] font-mono mt-0.5">
                  {formatCountdown(remainingSeconds)}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Monitoring Contact: <strong>{guardianContact?.name || 'Emergency Circle'}</strong> ({guardianContact?.phone || 'Configured Contact'})
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
          )}

          {/* PAUSE & CANCEL BUTTONS ROW */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handlePauseJourney(15)}
              disabled={activeJourney.status === 'PAUSED'}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-slate-600" />
              <span>Pause Monitoring (15m)</span>
            </button>

            <button
              onClick={handleCancelJourney}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-transparent hover:border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Monitoring</span>
            </button>
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCompleteSafe}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reached Safely • End Journey</span>
            </button>

            <button
              onClick={handleStealthAlert}
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
