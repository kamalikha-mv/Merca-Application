import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-[#0f1d32] text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 backdrop-blur-md">
        <div className="w-8 h-8 rounded-xl bg-[#e84e5f]/20 text-[#e84e5f] flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-slate-100 leading-snug line-clamp-2">
          {toastMessage}
        </p>
      </div>
    </div>
  );
};
