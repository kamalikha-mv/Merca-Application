import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SosButton } from '../components/emergency/SosButton';
import { EmergencyCategorySheet } from '../components/emergency/EmergencyCategorySheet';
import { LiveEmergencyBanner } from '../components/emergency/LiveEmergencyBanner';
import { AgenticChatbot } from '../components/chatbot/AgenticChatbot';
import { LocationShareModal } from '../components/map/LocationShareModal';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { OnboardingWizardModal } from '../components/onboarding/OnboardingWizardModal';
import { IncidentReportCardModal } from '../components/medical/IncidentReportCardModal';
import { VideoEvidenceRecorder } from '../components/evidence/VideoEvidenceRecorder';
import {
  Share2,
  Wrench,
  Compass,
  Phone,
  ShieldAlert,
  Hospital,
  ChevronRight,
  ExternalLink,
  Bot,
  Video,
  FileText,
  PhoneForwarded,
  HeartPulse,
  Flame,
  AlertTriangle,
  MapPin,
  Pill,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emergencyService } from '../services/emergencyService';
import { localDb } from '../services/storage';
import { NearbyService, EmergencyCategory } from '../types';

export const DashboardPage: React.FC = () => {
  const { location, triggerEmergency, emergencyStatus, activeAlert, showToast } = useApp();
  const navigate = useNavigate();

  // Modals State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !localDb.isOnboardingComplete());
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [isEvidenceRecorderOpen, setIsEvidenceRecorderOpen] = useState(false);
  const [isPatientCardOpen, setIsPatientCardOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<NearbyService | null>(null);

  const services = localDb.getServices();
  const nearestPolice = services.find((s) => s.category === 'police');
  const nearestHospital = services.find((s) => s.category === 'hospital');
  const nearestPharmacy = services.find((s) => s.category === 'pharmacy');

  const isEmergencyActive = emergencyStatus === 'DISPATCHED';
  const activeCategory: EmergencyCategory = activeAlert?.category || 'general';

  const handleCategorySelect = (category: EmergencyCategory) => {
    setIsCategoryOpen(false);
    triggerEmergency(category);
  };

  return (
    <div className="space-y-4 text-left">
      {/* 3-STEP FIRST TIME ONBOARDING WIZARD */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* EMERGENCY EVIDENCE RECORDER MODAL */}
      <VideoEvidenceRecorder
        isOpen={isEvidenceRecorderOpen}
        onClose={() => setIsEvidenceRecorderOpen(false)}
        incidentType={activeAlert?.category || 'General Emergency'}
      />

      {/* INCIDENT REPORT CARD MODAL */}
      <IncidentReportCardModal
        isOpen={isPatientCardOpen}
        onClose={() => setIsPatientCardOpen(false)}
        incidentType={activeAlert?.title || 'Emergency Incident Intake'}
      />

      {/* CATEGORY SHEET MODAL */}
      <EmergencyCategorySheet
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onSelectCategory={handleCategorySelect}
      />

      {/* LOCATION SHARE MODAL */}
      <LocationShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      {/* ACTIVE EMERGENCY BANNER (PULSING) */}
      <LiveEmergencyBanner />

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SOS CONTROLS & ADAPTIVE CRISIS ACTIONS (Cols: 7 on Desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* LOCATION STATUS BAR */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold text-[#5b6b82] uppercase tracking-wider block">
                  ACTIVE GPS POSITION
                </span>
                <span className="font-extrabold text-[#0f1d32] truncate block">
                  {location.address}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsShareOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors border border-blue-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share GPS</span>
            </button>
          </div>

          {/* MAIN CENTRAL SOS TRIGGER BUTTON */}
          <SosButton onOpenCategories={() => setIsCategoryOpen(true)} />

          {/* DYNAMIC SITUATIONAL ADAPTIVE GUIDANCE PANEL (ADAPTS TO ACTIVE CATEGORY) */}
          {isEmergencyActive && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-50 to-white border-2 border-[#e84e5f]/30 shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e84e5f] animate-ping" />
                  <h4 className="text-xs font-black text-[#e84e5f] uppercase tracking-wider">
                    Adaptive Incident Actions ({activeCategory.toUpperCase()})
                  </h4>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  Voice Guidance Active
                </span>
              </div>

              {/* SITUATION SPECIFIC GUIDANCE & SHORTCUTS */}
              {(activeCategory === 'threat' || activeCategory === 'assault' || activeCategory === 'unsafe') && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    ⚠️ <strong>Discreet Protocol:</strong> Move towards a crowded, illuminated zone. Authorities & ICE contacts are receiving your live breadcrumb trail.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setIsEvidenceRecorderOpen(true)}
                      className="px-3 py-2 rounded-xl bg-[#0f1d32] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5 text-[#e84e5f]" />
                      <span>Record 3m Video Evidence</span>
                    </button>
                    <a
                      href="tel:1091"
                      className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Women Helpline 1091</span>
                    </a>
                  </div>
                </div>
              )}

              {activeCategory === 'medical' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    🩺 <strong>Medical Protocol:</strong> Keep patient calm. 108 Ambulance service alerted. Paramedic intake card is prepared with blood group & allergies.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setIsPatientCardOpen(true)}
                      className="px-3 py-2 rounded-xl bg-[#e84e5f] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Paramedic Patient Card</span>
                    </button>
                    <a
                      href="tel:108"
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct 108 Ambulance Call</span>
                    </a>
                  </div>
                </div>
              )}

              {activeCategory === 'vehicle' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    🔧 <strong>Breakdown Protocol:</strong> Turn on vehicle hazard flashers. Stay behind the crash barrier on NHAI GST highway.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:1033"
                      className="px-3 py-2 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call NHAI Highway 1033</span>
                    </a>
                    <button
                      onClick={() => navigate('/breakdown')}
                      className="px-3 py-2 rounded-xl bg-[#0f1d32] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Mechanic Dispatch</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUICK ACTION TILES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* TILE 1: BREAKDOWN */}
            <button
              onClick={() => navigate('/breakdown')}
              className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] hover:border-amber-400 shadow-xs flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#0f1d32] mt-1">Breakdown</span>
              <span className="text-[10px] text-amber-700 font-semibold">Towing & Repair</span>
            </button>

            {/* TILE 2: GUARDIAN */}
            <button
              onClick={() => navigate('/guardian')}
              className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] hover:border-emerald-400 shadow-xs flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#0f1d32] mt-1">Guardian</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Route Safety Watch</span>
            </button>

            {/* TILE 3: EVIDENCE RECORDER */}
            <button
              onClick={() => navigate('/evidence')}
              className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] hover:border-purple-400 shadow-xs flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#0f1d32] mt-1">Evidence Cam</span>
              <span className="text-[10px] text-purple-700 font-semibold">3-Min GPS Video</span>
            </button>

            {/* TILE 4: PATIENT CARD */}
            <button
              onClick={() => setIsPatientCardOpen(true)}
              className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] hover:border-rose-400 shadow-xs flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e84e5f] flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#0f1d32] mt-1">Patient Card</span>
              <span className="text-[10px] text-rose-700 font-semibold">108 Intake Summary</span>
            </button>
          </div>

          {/* AI AGENT TOGGLE BAR */}
          <div className="bg-white rounded-2xl border border-[#e5ebf3] p-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#e84e5f] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f1d32]">Mecra Autonomous AI Agent</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Autonomous emergency guidance & location-aware dispatcher
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAiChat(!showAiChat)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                showAiChat
                  ? 'bg-[#0f1d32] text-white'
                  : 'bg-[#f1f5fb] text-[#0f1d32] hover:bg-slate-200'
              }`}
            >
              {showAiChat ? 'Hide Agent' : 'Open AI Agent'}
            </button>
          </div>

          {/* COLLAPSIBLE AGENTIC AI CHATBOT */}
          {showAiChat && (
            <div className="animate-fadeIn">
              <AgenticChatbot />
            </div>
          )}

          {/* REGIONAL HELPLINE QUICK CALL TILES (INDIA) */}
          <div className="bg-white rounded-3xl border border-[#e5ebf3] p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e84e5f]" />
                Direct Indian Emergency Lines (Toll-Free)
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                No SIM Credit Needed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <span className="text-sm font-black text-blue-700 group-hover:scale-105 transition-transform">
                  112
                </span>
                <span className="text-[10px] text-slate-600 font-semibold mt-0.5">Police & All-In-One</span>
              </a>

              <a
                href="tel:108"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <span className="text-sm font-black text-[#e84e5f] group-hover:scale-105 transition-transform">
                  108
                </span>
                <span className="text-[10px] text-slate-600 font-semibold mt-0.5">Ambulance & Trauma</span>
              </a>

              <a
                href="tel:1091"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <span className="text-sm font-black text-purple-700 group-hover:scale-105 transition-transform">
                  1091
                </span>
                <span className="text-[10px] text-slate-600 font-semibold mt-0.5">Women Safety Cell</span>
              </a>

              <a
                href="tel:1033"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <span className="text-sm font-black text-amber-700 group-hover:scale-105 transition-transform">
                  1033
                </span>
                <span className="text-[10px] text-slate-600 font-semibold mt-0.5">NHAI Highway Towing</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE LEAFLET MAP & VERIFIED FACILITIES (Cols: 5 on Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* INTERACTIVE OPENSTREETMAP LEAFLET CONTAINER */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#0f1d32] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Live Radar Map & Verified Hubs
              </span>
              <button
                onClick={() => navigate('/map')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Full Screen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <InteractiveMap
              services={services}
              selectedService={selectedService}
              onSelectService={(svc) => setSelectedService(svc)}
              onOpenShareModal={() => setIsShareOpen(true)}
              heightClass="h-[380px] lg:h-[420px]"
            />
          </div>

          {/* VERIFIED LOCAL EMERGENCY HUBS STRIP (WITHIN 5-10KM) */}
          <div className="bg-white rounded-3xl border border-[#e5ebf3] p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Immediate Safe Hubs in {location.town || (location.isLive ? 'Your Area' : 'Your Sector')}
            </h4>

            {/* NEAREST POLICE */}
            {nearestPolice && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <strong className="text-[#0f1d32] truncate block font-bold">
                      {nearestPolice.name}
                    </strong>
                    <span className="text-slate-500 text-[11px] block">
                      📍 {nearestPolice.distanceKm} km • {nearestPolice.openHours}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${nearestPolice.phone.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            )}

            {/* NEAREST HOSPITAL */}
            {nearestHospital && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#e84e5f] flex items-center justify-center shrink-0">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <strong className="text-[#0f1d32] truncate block font-bold">
                      {nearestHospital.name}
                    </strong>
                    <span className="text-slate-500 text-[11px] block">
                      📍 {nearestHospital.distanceKm} km • 24/7 Casualty & Trauma
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${nearestHospital.phone.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>ER</span>
                </a>
              </div>
            )}

            {/* 24/7 PHARMACY */}
            {nearestPharmacy && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <strong className="text-[#0f1d32] truncate block font-bold">
                      {nearestPharmacy.name}
                    </strong>
                    <span className="text-slate-500 text-[11px] block">
                      📍 {nearestPharmacy.distanceKm} km • {nearestPharmacy.openHours}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${nearestPharmacy.phone.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Meds</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
