import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  VehicleType,
  BreakdownProblem,
  VehicleBreakdownRequest,
  NearbyService,
} from '../../types';
import { localDb } from '../../services/storage';
import { emergencyService } from '../../services/emergencyService';
import { locationService } from '../../services/locationService';
import {
  Wrench,
  Car,
  Truck,
  AlertTriangle,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Camera,
  Share2,
  RotateCcw,
  ShieldAlert,
  Flame,
  LifeBuoy,
  X,
  Zap,
} from 'lucide-react';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

// Dedicated Vector Icons for Vehicle Types
const VehicleIcon: React.FC<{ type: VehicleType; className?: string }> = ({ type, className = 'w-5 h-5' }) => {
  switch (type) {
    case 'Car':
      return <Car className={className} />;
    case 'Motorcycle':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6h-3l-2.5 5h-4" />
          <path d="M9 17.5 12 11h4l2.5 6.5" />
          <path d="M13 6l2 5" />
        </svg>
      );
    case 'Scooter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M9 18h6" />
          <path d="m15 18 2-10h-3" />
          <path d="M14 8h4" />
          <path d="m9 15 2-4h2" />
        </svg>
      );
    case 'Truck':
      return <Truck className={className} />;
    default:
      return <Car className={className} />;
  }
};

export const BreakdownWizard: React.FC = () => {
  const { location, activeBreakdown, setActiveBreakdown, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(activeBreakdown ? 3 : 1);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [problem, setProblem] = useState<BreakdownProblem>('flat_tyre');
  const [notes, setNotes] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState<boolean>(false);
  const [isHazardFlasherActive, setIsHazardFlasherActive] = useState(false);
  const [flasherColor, setFlasherColor] = useState<'amber' | 'white'>('amber');

  const mechanics = localDb.getServices('mechanic');

  // Night Hazard Flasher Effect
  useEffect(() => {
    let flasherInterval: number | null = null;
    if (isHazardFlasherActive) {
      flasherInterval = window.setInterval(() => {
        setFlasherColor((prev) => (prev === 'amber' ? 'white' : 'amber'));
      }, 500);
    }
    return () => {
      if (flasherInterval) clearInterval(flasherInterval);
    };
  }, [isHazardFlasherActive]);

  // Simulation timer when breakdown request is active
  useEffect(() => {
    if (!activeBreakdown) return;

    if (activeBreakdown.status === 'REQUESTED') {
      const t1 = setTimeout(() => {
        const assigned: VehicleBreakdownRequest = {
          ...activeBreakdown,
          status: 'EN_ROUTE',
          etaMinutes: 12,
        };
        setActiveBreakdown(assigned);
        showToast('🚗 Mobile Roadside Recovery Dispatched: Mechanic is en-route (ETA: 12m)', 'success');
      }, 5000);
      return () => clearTimeout(t1);
    }
  }, [activeBreakdown, setActiveBreakdown, showToast]);

  const handleCreateRequest = () => {
    const selectedMechanic = mechanics[0];
    const newRequest: VehicleBreakdownRequest = {
      id: 'bd-' + Date.now(),
      vehicleType,
      problem,
      description: notes || `Breakdown assistance for ${vehicleType} with ${problem.replace('_', ' ')}`,
      status: 'REQUESTED',
      assignedMechanic: selectedMechanic,
      requestedAt: Date.now(),
      etaMinutes: 15,
      location,
    };

    setActiveBreakdown(newRequest);
    setStep(3);
    showToast('Roadside request submitted! Searching closest mobile mechanic...', 'info');
  };

  const handleResolve = () => {
    setActiveBreakdown(null);
    setStep(1);
    setNotes('');
    setSimulatedPhoto(false);
    showToast('✅ Vehicle breakdown resolved and closed.', 'success');
  };

  const problemOptions: { id: BreakdownProblem; label: string; icon: string }[] = [
    { id: 'flat_tyre', label: 'Flat Tyre / Puncture', icon: '🛞' },
    { id: 'battery_dead', label: 'Dead Battery / Jumpstart', icon: '🔋' },
    { id: 'engine_overheat', label: 'Engine Overheating / Smoke', icon: '🌡️' },
    { id: 'empty_fuel', label: 'Out of Fuel / EV Charge', icon: '⛽' },
    { id: 'towing_needed', label: 'Flatbed Towing Needed', icon: '🚛' },
    { id: 'brake_failure', label: 'Brake or Steering Issue', icon: '🛑' },
    { id: 'locked_out', label: 'Key Locked Inside Car', icon: '🔑' },
    { id: 'accident_minor', label: 'Minor Road Collision', icon: '⚠️' },
  ];

  return (
    <div className="p-4 space-y-4 text-left">
      {/* FULLSCREEN NIGHT HAZARD STROBE FLASHER */}
      {isHazardFlasherActive && (
        <div
          onClick={() => setIsHazardFlasherActive(false)}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 transition-colors duration-150 cursor-pointer ${
            flasherColor === 'amber' ? 'bg-amber-500 text-black' : 'bg-white text-slate-900'
          }`}
        >
          <div className="text-center pt-8">
            <span className="text-xs font-black uppercase tracking-widest block">
              MECRA EMERGENCY BEACON
            </span>
            <h2 className="text-3xl font-black mt-1">HAZARD WARNING STROBE ACTIVE</h2>
            <p className="text-sm font-bold mt-2 max-w-sm mx-auto">
              Place your phone screen flat against the rear window or windshield facing incoming traffic.
            </p>
          </div>

          <div className="w-24 h-24 rounded-full border-4 border-current flex items-center justify-center animate-ping">
            <AlertTriangle className="w-12 h-12" />
          </div>

          <div className="text-center pb-8">
            <button
              onClick={() => setIsHazardFlasherActive(false)}
              className="px-6 py-3 rounded-2xl bg-black text-white font-black text-sm uppercase shadow-2xl"
            >
              Tap Anywhere to Stop Beacon
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
            HIGHWAY ROADSIDE RECOVERY
          </span>
          <h2 className="text-xl font-black text-[#0f1d32] m-0">Vehicle Breakdown Assistance</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* NIGHT FLASHER BEACON BUTTON */}
          <button
            onClick={() => setIsHazardFlasherActive(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Hazard Strobe Beacon</span>
          </button>
          <HonestStatusBadge type="simulation" label="GPS DISPATCH" />
        </div>
      </div>

      {/* CRITICAL HIGHWAY SAFETY CHECKLIST (CRISIS PROTOCOL) */}
      <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>High-Stress Safety Checklist: 4 Immediate Steps</span>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
            Life Safety First
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
            <span>Turn on hazard warning lights immediately to alert traffic behind.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
            <span>Steer completely onto the left emergency shoulder or dirt verge.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
            <span>Exit strictly via passenger door away from traffic lanes.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">4</span>
            <span>Stand safely behind the highway crash barrier while waiting.</span>
          </div>
        </div>
      </div>

      {/* STEP 1: VEHICLE & PROBLEM SELECTION */}
      {step === 1 && (
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-5">
          {/* VEHICLE TYPE SELECTOR WITH DISTINCT ICONS */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-2">
              Select Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Car', 'Motorcycle', 'Scooter', 'Truck'] as VehicleType[]).map((vt) => (
                <button
                  key={vt}
                  onClick={() => setVehicleType(vt)}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1.5 cursor-pointer ${
                    vehicleType === vt
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-102'
                      : 'bg-[#f8fafd] text-[#0f1d32] border-[#e5ebf3] hover:bg-slate-100'
                  }`}
                >
                  <VehicleIcon type={vt} className="w-5 h-5" />
                  <span>{vt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PROBLEM SELECTION GRID */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-2">
              What is the issue?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {problemOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setProblem(opt.id)}
                  className={`p-3 rounded-2xl text-left border text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    problem === opt.id
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                      : 'bg-[#f8fafd] border-[#e5ebf3] text-[#0f1d32] hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* NEXT BUTTON */}
          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-md active:scale-98 transition-transform"
          >
            Continue to Location & Mechanic Dispatch →
          </button>
        </div>
      )}

      {/* STEP 2: REVIEW DETAILS & CONFIRM DISPATCH */}
      {step === 2 && (
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-[#0f1d32]">Review Details & Send</h3>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              ← Edit Issue
            </button>
          </div>

          {/* SELECTED PROBLEM SUMMARY */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <VehicleIcon type={vehicleType} className="w-4 h-4 text-amber-600" />
              <span>{vehicleType} • {problem.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Dispatching closest highway recovery flatbed with tool set.
            </p>
          </div>

          {/* CURRENT GPS LOCATION */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Breakdown Location (Auto-Pinned)
            </label>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-[#0f1d32] font-semibold flex items-center justify-between">
              <span className="truncate">{location.address}</span>
              <span className="text-[10px] text-blue-600 font-mono shrink-0 ml-2">±{location.accuracy}m</span>
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1">
              Additional Notes (Landmark, Car Model, etc.)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. White Swift, standing near NH 45 toll plaza mile 32..."
              className="w-full p-2.5 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-2xl focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* CONFIRM BUTTON */}
          <button
            onClick={handleCreateRequest}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-md active:scale-98 transition-transform"
          >
            Dispatch Nearest Roadside Mechanic
          </button>
        </div>
      )}

      {/* STEP 3: ACTIVE REQUEST TRACKER */}
      {step === 3 && activeBreakdown && (
        <div className="bg-white p-5 rounded-3xl border-2 border-amber-400 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
                ACTIVE BREAKDOWN DISPATCH
              </span>
              <h3 className="text-base font-black text-[#0f1d32]">
                {activeBreakdown.vehicleType} • {activeBreakdown.problem.replace('_', ' ')}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              {activeBreakdown.status}
            </span>
          </div>

          {/* ESTIMATED ARRIVAL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Estimated Mechanic Arrival</span>
                <strong className="text-lg font-black text-[#0f1d32]">
                  {activeBreakdown.etaMinutes} Minutes
                </strong>
              </div>
            </div>
          </div>

          {/* MECHANIC DETAILS */}
          {activeBreakdown.assignedMechanic && (
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#0f1d32] block">
                    {activeBreakdown.assignedMechanic.name}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    📍 {activeBreakdown.assignedMechanic.distanceKm} km away • {activeBreakdown.assignedMechanic.openHours}
                  </span>
                </div>
                <a
                  href={`tel:${activeBreakdown.assignedMechanic.phone.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                emergencyService.openWhatsApp(
                  activeBreakdown.assignedMechanic?.phone.split('/')[0].trim() || '9840123456',
                  `Breakdown Location: ${location.address}. Need roadside assistance for ${activeBreakdown.vehicleType}.`
                );
              }}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp GPS</span>
            </button>

            <button
              onClick={handleResolve}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Issue Resolved</span>
            </button>
          </div>
        </div>
      )}

      {/* DIRECT INDIAN HIGHWAY EMERGENCY HELPLINES */}
      <div className="bg-white rounded-3xl border border-[#e5ebf3] p-4 shadow-xs space-y-2.5">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
          Official Highway Helplines (24/7 Toll-Free)
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <a
            href="tel:1033"
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition-colors block cursor-pointer"
          >
            <span className="text-sm font-black text-amber-700 block">1033</span>
            <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">NHAI Highway Tow</span>
          </a>
          <a
            href="tel:112"
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-center transition-colors block cursor-pointer"
          >
            <span className="text-sm font-black text-blue-700 block">112</span>
            <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">Highway Police</span>
          </a>
          <a
            href="tel:108"
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-center transition-colors block cursor-pointer"
          >
            <span className="text-sm font-black text-[#e84e5f] block">108</span>
            <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">Ambulance Trauma</span>
          </a>
        </div>
      </div>
    </div>
  );
};
