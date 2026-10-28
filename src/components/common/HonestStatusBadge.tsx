import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface HonestStatusBadgeProps {
  type?: 'simulation' | 'initiated' | 'verified' | 'offline';
  label?: string;
  className?: string;
}

export const HonestStatusBadge: React.FC<HonestStatusBadgeProps> = ({
  type = 'simulation',
  label,
  className = '',
}) => {
  const configs = {
    simulation: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <Info className="w-3 h-3 text-emerald-600" />,
      defaultText: 'DEMO PROTOTYPE · LOCAL SIMULATION',
    },
    initiated: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: <Info className="w-3 h-3 text-amber-600" />,
      defaultText: 'ACTION INITIATED · AWAITING ACK',
    },
    verified: {
      bg: 'bg-blue-50 text-blue-900 border-blue-200',
      icon: <ShieldCheck className="w-3 h-3 text-blue-600" />,
      defaultText: 'VERIFIED OFFICIAL DATA',
    },
    offline: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <Info className="w-3 h-3 text-slate-500" />,
      defaultText: 'OFFLINE CACHED MODE',
    },
  };

  const current = configs[type];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-2xs ${current.bg} ${className}`}
    >
      {current.icon}
      <span>{label || current.defaultText}</span>
    </div>
  );
};
