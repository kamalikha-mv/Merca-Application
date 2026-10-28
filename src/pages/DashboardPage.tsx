import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SosButton } from '../components/emergency/SosButton';
import { EmergencyCategorySheet } from '../components/emergency/EmergencyCategorySheet';
import { LiveEmergencyBanner } from '../components/emergency/LiveEmergencyBanner';
import { AgenticChatbot } from '../components/chatbot/AgenticChatbot';
import { LocationShareModal } from '../components/map/LocationShareModal';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emergencyService } from '../services/emergencyService';
import { localDb } from '../services/storage';

export const DashboardPage: React.FC = () => {
  const { location, triggerEmergency, emergencyStatus, dispatchedPoliceStation } = useApp();
  const navigate = useNavigate();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  const nearestPolice = localDb.getServices('police')[0];
  const nearestHospital = localDb.getServices('hospital')[0];

  return (
    <div className="pb-6 text-left">
      {/* ACTIVE EMERGENCY BANNER IF ACTIVE */}
      <LiveEmergencyBanner />

      {/* LOCATION & QUICK STATUS PILL */}
      <div className="px-4 pt-2">
        <div className="p-3 bg-white rounded-2xl border border-[#e5ebf3] shadow-2xs flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#5b6b82] uppercase tracking-wider block">
              ANCHOR LOCATION
            </span>
            <span className="font-bold text-[#0f1d32] line-clamp-1">
              {location.address}
            </span>
          </div>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* CENTRAL SOS BUTTON WITH RADAR RINGS */}
      <SosButton onOpenCategories={() => setIsCategoryOpen(true)} />

      {/* QUICK EMERGENCY ACTION TILES */}
      <div className="px-4 my-3">
        <div className="grid grid-cols-3 gap-2">
          {/* TILE 1: BREAKDOWN */}
          <button
            onClick={() => navigate('/breakdown')}
            className="p-3 bg-white rounded-2xl border border-[#e5ebf3] hover:border-amber-300 shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#0f1d32]">Breakdown</span>
            <span className="text-[10px] text-amber-700 font-semibold">Towing / Repair</span>
          </button>

          {/* TILE 2: GUARDIAN TRANSIT */}
          <button
            onClick={() => navigate('/guardian')}
            className="p-3 bg-white rounded-2xl border border-[#e5ebf3] hover:border-emerald-300 shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#0f1d32]">Guardian</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Route Watch</span>
          </button>

          {/* TILE 3: EMERGENCY AI CHAT */}
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            className={`p-3 rounded-2xl border shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 ${
              showAiChat
                ? 'bg-[#e84e5f] text-white border-[#e84e5f]'
                : 'bg-white border-[#e5ebf3] hover:border-rose-300'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${
                showAiChat ? 'bg-white text-[#e84e5f]' : 'bg-rose-50 text-[#e84e5f]'
              }`}
            >
              <Bot className="w-4 h-4" />
            </div>
            <span className={`text-xs font-bold ${showAiChat ? 'text-white' : 'text-[#0f1d32]'}`}>
              Mecra AI
            </span>
            <span
              className={`text-[10px] font-semibold ${
                showAiChat ? 'text-rose-100' : 'text-[#e84e5f]'
              }`}
            >
              Situational Agent
            </span>
          </button>
        </div>
      </div>

      {/* EMBEDDED AGENTIC AI ASSISTANT (COLLAPSIBLE / EXPANDABLE) */}
      {showAiChat && (
        <div className="px-4 my-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#e84e5f] uppercase tracking-wider">
              AGENTIC EMERGENCY CHATBOT
            </span>
            <button
              onClick={() => setShowAiChat(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              Close ✕
            </button>
          </div>
          <AgenticChatbot />
        </div>
      )}

      {/* CLOSEST RESCUE HUBS STRIP */}
      <div className="px-4 mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0f1d32] uppercase tracking-wider">
            Nearest Emergency Hubs
          </span>
          <button
            onClick={() => navigate('/map')}
            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
          >
            <span>Explore Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* POLICE CARD */}
        {nearestPolice && (
          <div className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#0f1d32] block">
                  {nearestPolice.name}
                </strong>
                <span className="text-[11px] text-[#5b6b82] block">
                  📍 {nearestPolice.distanceKm} km away • {nearestPolice.openHours}
                </span>
              </div>
            </div>

            <button
              onClick={() => emergencyService.callNumber(nearestPolice.phone)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </button>
          </div>
        )}

        {/* HOSPITAL CARD */}
        {nearestHospital && (
          <div className="p-3.5 bg-white rounded-2xl border border-[#e5ebf3] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-red-600 flex items-center justify-center shrink-0">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#0f1d32] block">
                  {nearestHospital.name}
                </strong>
                <span className="text-[11px] text-[#5b6b82] block">
                  📍 {nearestHospital.distanceKm} km away • Level 1 Trauma Center
                </span>
              </div>
            </div>

            <button
              onClick={() => emergencyService.callNumber(nearestHospital.phone)}
              className="px-3 py-1.5 rounded-xl bg-[#e84e5f] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <Phone className="w-3 h-3" />
              <span>ER</span>
            </button>
          </div>
        )}
      </div>

      {/* CATEGORY SHEET MODAL */}
      <EmergencyCategorySheet
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onSelectCategory={(cat) => triggerEmergency(cat)}
      />

      {/* LOCATION SHARE MODAL */}
      <LocationShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
};
