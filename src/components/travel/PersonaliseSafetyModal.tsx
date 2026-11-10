import React, { useState } from 'react';
import { PersonalisationPreferences } from '../../types/travelSafety';
import {
  Sparkles,
  X,
  User,
  Users,
  Car,
  Sun,
  Moon,
  Accessibility,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface PersonaliseSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences?: PersonalisationPreferences;
  onSavePreferences: (prefs: PersonalisationPreferences) => void;
}

export const PersonaliseSafetyModal: React.FC<PersonaliseSafetyModalProps> = ({
  isOpen,
  onClose,
  currentPreferences,
  onSavePreferences,
}) => {
  const [ageGroup, setAgeGroup] = useState<PersonalisationPreferences['ageGroup']>(
    currentPreferences?.ageGroup || '25-45'
  );
  const [gender, setGender] = useState<PersonalisationPreferences['gender']>(
    currentPreferences?.gender || 'prefer_not_to_say'
  );
  const [travelParty, setTravelParty] = useState<PersonalisationPreferences['travelParty']>(
    currentPreferences?.travelParty || 'solo'
  );
  const [modeOfTransport, setModeOfTransport] = useState<
    PersonalisationPreferences['modeOfTransport']
  >(currentPreferences?.modeOfTransport || 'car_taxi');
  const [timeOfDay, setTimeOfDay] = useState<PersonalisationPreferences['timeOfDay']>(
    currentPreferences?.timeOfDay || 'dusk_night'
  );
  const [accessibility, setAccessibility] = useState<string[]>(
    currentPreferences?.accessibilityRequirements || []
  );
  const [preferences, setPreferences] = useState<string[]>(
    currentPreferences?.personalPreferences || [
      'prioritize_well_lit',
      'avoid_isolated_stretches',
    ]
  );

  if (!isOpen) return null;

  const togglePreference = (key: string) => {
    setPreferences((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleAccessibility = (key: string) => {
    setAccessibility((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    onSavePreferences({
      ageGroup,
      gender,
      travelParty,
      modeOfTransport,
      timeOfDay,
      accessibilityRequirements: accessibility,
      personalPreferences: preferences,
    });
    onClose();
  };

  const handleReset = () => {
    setAgeGroup('25-45');
    setGender('prefer_not_to_say');
    setTravelParty('solo');
    setModeOfTransport('car_taxi');
    setTimeOfDay('day');
    setAccessibility([]);
    setPreferences([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col text-left">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0f1d32] to-[#1e3458] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center absolute right-4 top-4 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#e84e5f] text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Personalise My Safety Recommendations
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Optional criteria used strictly on your device to refine route safety weighting, lighting priorities, and safe hub recommendations. No unsupported assumptions made.
          </p>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* 1. TRAVEL PARTY */}
          <div className="space-y-2">
            <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
              Travelling Alone or With Others?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'solo', label: 'Solo Traveler', icon: User },
                { key: 'family_with_kids', label: 'Family / Kids', icon: Users },
                { key: 'group', label: 'Travel Group', icon: Users },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setTravelParty(opt.key as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                    travelParty === opt.key
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. MODE OF TRANSPORT */}
          <div className="space-y-2">
            <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
              Mode of Transport
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'car_taxi', label: 'Car / Cab' },
                { key: 'two_wheeler', label: '2-Wheeler / Bike' },
                { key: 'public_bus', label: 'Public Bus' },
                { key: 'walking', label: 'Walking / Cab' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setModeOfTransport(opt.key as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                    modeOfTransport === opt.key
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. TIME OF DAY */}
          <div className="space-y-2">
            <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
              Time of Travel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'day', label: 'Daylight Travel', icon: Sun },
                { key: 'dusk_night', label: 'Dusk / Night (6-11 PM)', icon: Moon },
                { key: 'late_night', label: 'Late Night (11 PM - 5 AM)', icon: Moon },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setTimeOfDay(opt.key as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                    timeOfDay === opt.key
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. AGE GROUP & GENDER (OPTIONAL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="18-24">Young Adult (18-24)</option>
                <option value="25-45">Adult (25-45)</option>
                <option value="46-60">Mature Adult (46-60)</option>
                <option value="60+">Senior (60+)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="prefer_not_to_say">Prefer Not to Say</option>
                <option value="female">Female (Highlight Pink Patrol)</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-Binary</option>
              </select>
            </div>
          </div>

          {/* 5. SPECIFIC PERSONAL SAFETY PREFERENCES */}
          <div className="space-y-2">
            <label className="font-black text-[#0f1d32] uppercase tracking-wider block">
              Personal Travel Priorities
            </label>
            <div className="space-y-1.5">
              {[
                {
                  key: 'prioritize_well_lit',
                  title: 'Prioritize 100% Well-Lit Highways',
                  desc: 'Eliminates dark service lanes and unlit shortcut detours.',
                },
                {
                  key: 'avoid_isolated_stretches',
                  title: 'Avoid Sparsely Inhabited Stretches',
                  desc: 'Favors corridors with active 24/7 businesses, fuel stations, and eateries.',
                },
                {
                  key: 'highway_with_tolls',
                  title: 'Prefer Highways with Manned Toll Plazas',
                  desc: 'Toll corridors have active CCTV, dedicated tow cranes, and mobile police units.',
                },
                {
                  key: 'female_assisted_safe_hubs',
                  title: 'Highlight Female-Assisted Safe Havens & Pink Patrol Desks',
                  desc: 'Surfaces 24/7 guarded transit lounges and women helpline booths.',
                },
              ].map((p) => {
                const isChecked = preferences.includes(p.key);
                return (
                  <div
                    key={p.key}
                    onClick={() => togglePreference(p.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold leading-tight">
                        {p.title}
                      </strong>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. ACCESSIBILITY */}
          <div className="space-y-2">
            <label className="font-black text-[#0f1d32] uppercase tracking-wider block flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-blue-600" />
              Accessibility & Medical Support
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'wheelchair', label: 'Wheelchair / Ramp Access' },
                { key: 'oxygen', label: 'Nearby Medical Oxygen & Trauma' },
              ].map((a) => {
                const isChecked = accessibility.includes(a.key);
                return (
                  <button
                    type="button"
                    key={a.key}
                    onClick={() => toggleAccessibility(a.key)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isChecked
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && '✓'}
                    </span>
                    <span>{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Refine Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
