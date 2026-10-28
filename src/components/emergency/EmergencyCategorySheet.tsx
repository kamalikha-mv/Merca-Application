import React from 'react';
import { EmergencyCategory } from '../../types';
import {
  ShieldAlert,
  HeartPulse,
  Wrench,
  AlertOctagon,
  Flame,
  MapPin,
  X,
  ArrowRight,
} from 'lucide-react';

interface EmergencyCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: EmergencyCategory) => void;
}

export const EmergencyCategorySheet: React.FC<EmergencyCategorySheetProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  const categories: {
    id: EmergencyCategory;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }[] = [
    {
      id: 'unsafe',
      title: 'I Feel Unsafe / Suspicious',
      subtitle: 'Move to safe spot, step-by-step guidance, prepare contact order.',
      icon: <ShieldAlert className="w-5 h-5 text-[#e84e5f]" />,
      color: 'border-rose-200 hover:border-rose-400',
      bg: 'bg-rose-50/70',
    },
    {
      id: 'medical',
      title: 'Medical Emergency',
      subtitle: 'Dispatch health alert with blood type & allergy details.',
      icon: <HeartPulse className="w-5 h-5 text-red-600" />,
      color: 'border-red-200 hover:border-red-400',
      bg: 'bg-red-50/70',
    },
    {
      id: 'vehicle',
      title: 'Vehicle Breakdown & Towing',
      subtitle: 'Puncture, engine heat, dead battery, or towing needed.',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-200 hover:border-amber-400',
      bg: 'bg-amber-50/70',
    },
    {
      id: 'assault',
      title: 'Physical Threat / Assault',
      subtitle: 'Instant police station signal & immediate Priority 1 alert.',
      icon: <AlertOctagon className="w-5 h-5 text-purple-600" />,
      color: 'border-purple-200 hover:border-purple-400',
      bg: 'bg-purple-50/70',
    },
    {
      id: 'fire',
      title: 'Fire or Gas / Chemical Hazard',
      subtitle: 'Evacuation instructions and Fire Rescue station dispatch.',
      icon: <Flame className="w-5 h-5 text-orange-600" />,
      color: 'border-orange-200 hover:border-orange-400',
      bg: 'bg-orange-50/70',
    },
    {
      id: 'lost',
      title: "Lost & Stranded Alone",
      subtitle: 'Location share link & guidance toward nearest safe public haven.',
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
      color: 'border-blue-200 hover:border-blue-400',
      bg: 'bg-blue-50/70',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto text-left">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 sticky top-0 bg-white">
          <div>
            <span className="text-[10px] font-bold text-[#e84e5f] uppercase tracking-wider block">
              SITUATION SELECTOR
            </span>
            <h3 className="text-base font-black text-[#0f1d32] m-0">
              What do you need help with?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LIST OF CATEGORIES */}
        <div className="space-y-2 py-1">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelectCategory(c.id);
                onClose();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:shadow-sm active:scale-98 ${c.bg} ${c.color}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0f1d32] m-0">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[#5b6b82] leading-snug mt-0.5 line-clamp-1">
                    {c.subtitle}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
