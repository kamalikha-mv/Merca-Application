import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const LiveEmergencyBanner: React.FC = () => {
  const {
    emergencyStatus,
    activeAlert,
    dispatchedPoliceStation,
    escalationStep,
    contacts,
    markUserSafe,
    cancelEmergency,
    showToast,
  } = useApp();

  if (emergencyStatus !== 'DISPATCHED' || !activeAlert) return null;

  const currentContact = contacts[escalationStep - 1] || contacts[0];

  const handleShareWhatsApp = () => {
    if (activeAlert) {
      const msg = emergencyService.buildEmergencyMessage(
        activeAlert.category,
        activeAlert.location
      );
      emergencyService.openWhatsApp(currentContact?.phone || '', msg);
    }
  };

  const handleCallPolice = () => {
    if (dispatchedPoliceStation?.phone) {
      emergencyService.callNumber(dispatchedPoliceStation.phone);
    }
  };

  return (
    <div className="bg-[#101e33] text-white p-4 sm:p-5 rounded-3xl mx-4 my-3 shadow-xl border-2 border-[#e84e5f] animate-in fade-in slide-in-from-top-2 text-left space-y-4">
      {/* TOP HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#e84e5f] animate-ping shrink-0" />
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#e84e5f] uppercase block">
              LIVE EMERGENCY ACTIVE
            </span>
            <h3 className="text-base font-black text-white m-0">
              {activeAlert.category.toUpperCase()} ALERT DISPATCHED
            </h3>
          </div>
        </div>

        <HonestStatusBadge type="simulation" label="SIMULATED ACTION" />
      </div>

      {/* DISPATCHED POLICE / HELP DESK CARD */}
      <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Nearby Police Station Alerted:
          </span>
          <strong className="text-xs text-white block mt-0.5">
            {dispatchedPoliceStation?.name || 'Metropolitan Central Police'}
          </strong>
          <span className="text-[10px] text-emerald-400 font-mono">
            Direct Dispatch Line: {dispatchedPoliceStation?.phone || '100 / 911'}
          </span>
        </div>

        <button
          onClick={handleCallPolice}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Desk</span>
        </button>
      </div>

      {/* CONTACT ESCALATION TIMELINE BAR */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-300">
          <span className="font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#e84e5f]" />
            <span>Escalation Protocol: Priority {escalationStep} Active</span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">
            Target: {currentContact?.name}
          </span>
        </div>

        {/* 3 STEPS PROGRESS INDICATORS */}
        <div className="grid grid-cols-3 gap-1.5">
          {contacts.slice(0, 3).map((c, idx) => {
            const stepNum = idx + 1;
            const isDone = escalationStep > stepNum;
            const isCurrent = escalationStep === stepNum;

            return (
              <div
                key={c.id}
                className={`p-2 rounded-xl border text-[10px] leading-snug transition-all ${
                  isCurrent
                    ? 'bg-rose-950/80 border-[#e84e5f] text-white font-bold shadow-xs'
                    : isDone
                    ? 'bg-slate-800 border-slate-700 text-slate-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>P{stepNum}</span>
                  {isDone && <span className="text-emerald-400">✓</span>}
                  {isCurrent && <span className="text-[#e84e5f] animate-pulse">●</span>}
                </div>
                <div className="truncate font-semibold mt-0.5">{c.name.split(' ')[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK COMM ACTIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleShareWhatsApp}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>WhatsApp Alert to {currentContact?.name.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => {
            if (currentContact?.phone) emergencyService.callNumber(currentContact.phone);
          }}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-blue-400" />
          <span>Call Contact</span>
        </button>
      </div>

      {/* RESOLUTION BUTTONS */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={markUserSafe}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I AM SAFE NOW (RESOLVE)</span>
        </button>

        <button
          onClick={() => cancelEmergency('User dismissed')}
          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
