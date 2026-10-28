import React from 'react';
import { ContactsManager } from '../components/profile/ContactsManager';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-8 space-y-4">
      {/* QUICK LINK TO ADVISORIES */}
      <div className="px-4 pt-4">
        <div
          onClick={() => navigate('/advisories')}
          className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <strong className="text-xs font-black text-[#0f1d32] block">
                Local Safety Advisories
              </strong>
              <span className="text-[11px] text-blue-900 leading-tight block">
                Verified road closures, hazards & weather warnings
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
        </div>
      </div>

      {/* CONTACTS & MEDICAL PROFILE */}
      <ContactsManager />

      {/* APP INFO FOOTER */}
      <div className="px-6 pt-2 pb-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-500">Mecra Mobile Application • v1.0.0 (Production Prototype)</p>
        <p className="text-[10px]">
          Designed for high-stress crisis management. Ready for Android APK native wrapping.
        </p>
      </div>
    </div>
  );
};
