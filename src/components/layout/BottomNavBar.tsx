import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Map, Wrench, Compass, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { emergencyStatus } = useApp();
  const isEmergency = emergencyStatus === 'DISPATCHED';

  const navItems = [
    { to: '/', label: 'Emergency', icon: ShieldAlert, activeColor: 'text-[#e84e5f]' },
    { to: '/map', label: 'Live Map', icon: Map, activeColor: 'text-blue-600' },
    { to: '/breakdown', label: 'Breakdown', icon: Wrench, activeColor: 'text-amber-600' },
    { to: '/guardian', label: 'Guardian', icon: Compass, activeColor: 'text-emerald-600' },
    { to: '/profile', label: 'Safety & ID', icon: UserCheck, activeColor: 'text-indigo-600' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#e5ebf3] safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? `${item.activeColor} font-bold scale-105`
                    : 'text-[#5b6b82] hover:text-[#0f1d32] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                    {item.to === '/' && isEmergency && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e84e5f] animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-current" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
