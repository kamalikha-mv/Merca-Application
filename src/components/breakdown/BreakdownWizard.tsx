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
  AlertTriangle,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Camera,
  Share2,
  RotateCcw,
} from 'lucide-react';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const BreakdownWizard: React.FC = () => {
  const { location, activeBreakdown, setActiveBreakdown, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(activeBreakdown ? 3 : 1);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [problem, setProblem] = useState<BreakdownProblem>('flat_tyre');
  const [notes, setNotes] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState<boolean>(false);

  const mechanics = localDb.getServices('mechanic');

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
        showToast('🚗 SpeedyRecovery dispatched: Mechanic is en-route (ETA: 12m)');
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
    showToast('Roadside request submitted! Searching closest mobile mechanic...');
  };

  const handleResolve = () => {
    setActiveBreakdown(null);
    setStep(1);
    setNotes('');
    setSimulatedPhoto(false);
    showToast('✅ Vehicle breakdown resolved and closed.');
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
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
            ROADSIDE ASSISTANCE
          </span>
          <h2 className="text-xl font-black text-[#0f1d32] m-0">Vehicle Breakdown</h2>
        </div>
        <HonestStatusBadge type="simulation" label="SIMULATED DISPATCH" />
      </div>

      {/* STEP 1: VEHICLE & PROBLEM SELECTION */}
      {step === 1 && (
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-5">
          {/* VEHICLE TYPE SELECTOR */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-2">
              Select Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Car', 'Motorcycle', 'Scooter', 'Truck'] as VehicleType[]).map((vt) => (
                <button
                  key={vt}
                  onClick={() => setVehicleType(vt)}
                  className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                    vehicleType === vt
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-[#f8fafd] text-[#0f1d32] border-[#e5ebf3] hover:bg-slate-100'
                  }`}
                >
                  <Car className="w-4 h-4" />
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
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md active:scale-98 transition-transform"
          >
            Continue to Location & Mechanic →
          </button>
        </div>
      )}

      {/* STEP 2: LOCATION VERIFICATION & OPTIONAL PHOTO */}
      {step === 2 && (
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-[#0f1d32]">Review Details & Send</h3>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              ← Edit Issue
            </button>
          </div>

          {/* SELECTED PROBLEM SUMMARY */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs">
            <span className="text-amber-800 font-bold block">
              Vehicle: {vehicleType} · Issue: {problem.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-slate-600 text-[11px] block mt-0.5">
              Breakdown Location: {location.address}
            </span>
          </div>

          {/* ADDITIONAL NOTES */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1.5">
              Additional Details / Landmarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Near petrol pump, hazard lights blinking, rear right tyre flat..."
              rows={2}
              className="w-full p-3 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-[#0f1d32]"
            />
          </div>

          {/* SIMULATED VEHICLE PHOTO UPLOAD */}
          <div>
            <label className="text-xs font-bold text-[#0f1d32] block mb-1.5">
              Vehicle / Tyre Photo (Optional)
            </label>
            <button
              onClick={() => {
                setSimulatedPhoto(!simulatedPhoto);
                showToast(simulatedPhoto ? 'Photo removed' : '📸 Vehicle photo captured & attached');
              }}
              className={`w-full py-3 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                simulatedPhoto
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-300 bg-[#f8fafd] text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="text-xs">
                {simulatedPhoto ? '✓ 1 Photo Attached (TyreDamage.jpg)' : 'Attach / Take Photo'}
              </span>
            </button>
          </div>

          {/* CONFIRM & DISPATCH MECHANIC */}
          <button
            onClick={handleCreateRequest}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md active:scale-98 transition-transform"
          >
            Dispatch Nearest Roadside Mechanic
          </button>
        </div>
      )}

      {/* STEP 3: LIVE MECHANIC TRACKER */}
      {step === 3 && activeBreakdown && (
        <div className="bg-white p-5 rounded-3xl border-2 border-amber-400 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-sm font-black text-[#0f1d32]">
                STATUS: {activeBreakdown.status}
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              ETA: ~{activeBreakdown.etaMinutes} mins
            </span>
          </div>

          {/* ASSIGNED MECHANIC CARD */}
          <div className="p-4 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3] space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Mobile Service
                </span>
                <strong className="text-sm font-black text-[#0f1d32]">
                  {activeBreakdown.assignedMechanic?.name || 'SpeedyRecovery 24/7 Roadside'}
                </strong>
                <p className="text-[11px] text-[#5b6b82] mt-0.5">
                  {activeBreakdown.assignedMechanic?.speciality}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-amber-600 block">
                  ⭐ 4.8 / 5.0
                </span>
                <span className="text-[10px] text-slate-500">275 reviews</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() =>
                  emergencyService.callNumber(activeBreakdown.assignedMechanic?.phone || '')
                }
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Mechanic</span>
              </button>

              <button
                onClick={() => {
                  const shareText = `🚗 [Mecra Breakdown] My ${vehicleType} broke down: ${problem}. Near: ${location.address}`;
                  emergencyService.openWhatsApp('', shareText);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Info</span>
              </button>
            </div>
          </div>

          {/* SAFETY ADVICE WHILE WAITING */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong className="block font-bold mb-0.5">Safety Check while waiting:</strong>
            1. Keep hazard warning lights flashing.<br />
            2. If on a high-speed road, wait behind the safety guardrail.<br />
            3. Do not accept unauthorized stranger tows without verified badge.
          </div>

          {/* RESOLVE BUTTON */}
          <button
            onClick={handleResolve}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Problem Resolved / Cancel Request</span>
          </button>
        </div>
      )}

      {/* NEARBY MECHANICS LIST */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#0f1d32] block">
          All Verified Mechanics in Your Vicinity
        </span>
        {mechanics.map((m) => (
          <div
            key={m.id}
            className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] shadow-2xs flex items-center justify-between gap-3 text-left"
          >
            <div>
              <strong className="text-xs sm:text-sm font-bold text-[#0f1d32] block">
                {m.name}
              </strong>
              <span className="text-[11px] text-[#5b6b82] block mt-0.5">{m.address}</span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                📍 {m.distanceKm} km away • {m.openHours}
              </span>
            </div>

            <button
              onClick={() => emergencyService.callNumber(m.phone)}
              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
