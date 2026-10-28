import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { localDb } from '../../services/storage';
import { TrustedContact, MedicalProfile } from '../../types';
import {
  ShieldCheck,
  MapPin,
  Bell,
  PhoneCall,
  UserPlus,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { location, refreshLocation, showToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDetecting, setIsDetecting] = useState(false);

  // Step 2: Contacts
  const [contacts, setContacts] = useState<TrustedContact[]>(() => localDb.getContacts());

  // Step 3: Medical ID
  const [medical, setMedical] = useState<MedicalProfile>(() => {
    const med = localDb.getMedical();
    return {
      ...med,
      cityTown: med.cityTown || (location.town ? `${location.town}, ${location.city}` : 'Kilambakkam, Chennai'),
    };
  });

  if (!isOpen) return null;

  // Handle Step 1 Permission and Detection
  const handleGrantPermission = async () => {
    setIsDetecting(true);
    await refreshLocation();
    setIsDetecting(false);
  };

  const handleStep1Next = () => {
    setStep(2);
  };

  // Handle Step 2 Contacts Save
  const handleContactChange = (index: number, field: keyof TrustedContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleStep2Next = () => {
    localDb.saveContacts(contacts);
    setStep(3);
  };

  // Handle Step 3 Finish
  const handleFinishOnboarding = () => {
    localDb.saveMedical(medical);
    localDb.setOnboardingComplete(true);
    showToast(
      'Mecra calibrated for your region. Real-time safety network active!',
      'success'
    );
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col">
        {/* TOP BANNER */}
        <div className="bg-gradient-to-r from-[#111e33] to-[#1c3052] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-[#e84e5f]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-black text-lg shadow-md">
                M
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                  MECRA SAFETY INITIALIZATION
                </h2>
                <p className="text-[11px] text-slate-300 font-medium mt-1">
                  Step {step} of 3 • First-Time Device Configuration
                </p>
              </div>
            </div>

            {/* STEP PROGRESS PILLS */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === s
                      ? 'bg-[#e84e5f] w-5'
                      : step > s
                      ? 'bg-emerald-400'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed relative z-10">
            {step === 1 &&
              'Grant emergency permissions to auto-detect your location and configure regional emergency dispatch lines.'}
            {step === 2 &&
              'Configure your Priority Emergency Contacts (pre-calibrated for regional mobile routing).'}
            {step === 3 &&
              'Set up your Emergency Medical ID card so first responders can treat you without delay.'}
          </p>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
          {/* STEP 1: PERMISSION & REGION DETECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#0f1d32] uppercase tracking-wide">
                      Location & Notification Permission
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Used exclusively on-device during crisis events to dispatch live GPS coordinates to verified emergency services.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700">
                      {location.isLive
                        ? 'Real-Time GPS Connected'
                        : 'Simulated Safe Baseline'}
                    </span>
                  </div>
                  <button
                    onClick={handleGrantPermission}
                    disabled={isDetecting}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0f1d32] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {isDetecting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Detecting...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Detect Live Location
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* DETECTED REGION HIGHLIGHT */}
              <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Detected Operational Region</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    Armed
                  </span>
                </div>
                <div className="text-sm font-black text-[#0f1d32]">
                  {location.town || 'Kilambakkam'}, {location.city || 'Chennai Metropolitan Area'}
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                  <span>Country Code: <strong className="text-slate-800">{location.countryCode || '+91'} (India)</strong></span>
                  <span>•</span>
                  <span>State: <strong className="text-slate-800">{location.state || 'Tamil Nadu'}</strong></span>
                </div>
              </div>

              {/* REGIONAL EMERGENCY NUMBERS */}
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#e84e5f]" />
                  Calibrated Indian Emergency Helplines
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-[#0f1d32] text-sm">112</div>
                    <div className="text-[11px] text-slate-600 font-medium">National Emergency (All-In-One)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-[#e84e5f] text-sm">108</div>
                    <div className="text-[11px] text-slate-600 font-medium">Ambulance & Trauma Casualty</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-purple-700 text-sm">1091</div>
                    <div className="text-[11px] text-slate-600 font-medium">Women Safety & Pink Patrol</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-amber-700 text-sm">1033</div>
                    <div className="text-[11px] text-slate-600 font-medium">NHAI Highway Towing & Patrol</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMERGENCY CONTACTS SETUP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Priority Contacts (Priority 1, 2, 3)
                </span>
                <span className="text-xs text-slate-500">
                  Pre-filled with Indian format ({location.countryCode || '+91'})
                </span>
              </div>

              {contacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#e84e5f] text-white text-[11px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#0f1d32]">
                        Priority {idx + 1} Contact
                      </span>
                    </div>
                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                      {idx === 0 ? 'Primary Responder' : idx === 1 ? 'Secondary Family' : 'Backup Circle'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f]"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Relation</label>
                      <input
                        type="text"
                        value={contact.relation}
                        onChange={(e) => handleContactChange(idx, 'relation', e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f]"
                        placeholder="e.g. Spouse / Brother"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f]"
                          placeholder="+91 98401 23456"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: MEDICAL ID CARD SETUP */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-3">
                <HeartPulse className="w-5 h-5 text-[#e84e5f] shrink-0" />
                <p className="text-xs text-rose-950 font-medium">
                  This card will be instantly accessible by emergency paramedics and hospital casualty officers during a 108 dispatch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Full Legal Name</label>
                  <input
                    type="text"
                    value={medical.fullName}
                    onChange={(e) => setMedical({ ...medical, fullName: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                    placeholder="e.g. Rahul Krishnan"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Blood Group</label>
                  <select
                    value={medical.bloodType}
                    onChange={(e) => setMedical({ ...medical, bloodType: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Known Allergies (Penicillin, Nuts, Latex, etc.)
                  </label>
                  <input
                    type="text"
                    value={medical.allergies}
                    onChange={(e) => setMedical({ ...medical, allergies: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                    placeholder="e.g. Penicillin, Peanuts (or None)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Severe Health Risks / Chronic Conditions
                  </label>
                  <input
                    type="text"
                    value={medical.severeHealthRisks}
                    onChange={(e) => setMedical({ ...medical, severeHealthRisks: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                    placeholder="e.g. Acute bronchial asthma during panic / dust exposure"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Current Medications</label>
                  <input
                    type="text"
                    value={medical.medications}
                    onChange={(e) => setMedical({ ...medical, medications: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                    placeholder="e.g. Inhaler (Albuterol)"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Home City / Town</label>
                  <input
                    type="text"
                    value={medical.cityTown}
                    onChange={(e) => setMedical({ ...medical, cityTown: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#e84e5f] mt-1"
                    placeholder="e.g. Kilambakkam, Chennai"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={handleStep1Next}
              className="px-5 py-2.5 rounded-xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Confirm & Set Contacts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleStep2Next}
              className="px-5 py-2.5 rounded-xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Save & Set Medical ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Launch Mecra</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
