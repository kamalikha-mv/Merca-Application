import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toastMessage, toastType } = useApp();

  if (!toastMessage) return null;

  let icon = <Bell className="w-4 h-4 text-[#e84e5f]" />;
  let badgeBg = 'bg-[#e84e5f]/20';
  let borderCol = 'border-slate-700/80';

  if (toastType === 'success') {
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    badgeBg = 'bg-emerald-500/20';
    borderCol = 'border-emerald-600/40';
  } else if (toastType === 'error') {
    icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
    badgeBg = 'bg-rose-500/20';
    borderCol = 'border-rose-600/50';
  } else if (toastType === 'info') {
    icon = <Info className="w-4 h-4 text-blue-400" />;
    badgeBg = 'bg-blue-500/20';
    borderCol = 'border-blue-600/40';
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-none transition-all duration-300 animate-fadeIn">
      <div className={`bg-[#0f1d32]/95 text-white p-3.5 rounded-2xl shadow-2xl border ${borderCol} flex items-center gap-3 backdrop-blur-md`}>
        <div className={`w-8 h-8 rounded-xl ${badgeBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <p className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
          {toastMessage}
        </p>
      </div>
    </div>
  );
};
