import React from 'react';
import { RouteMilestone } from '../../types/travelSafety';
import {
  MapPin,
  Train,
  Fuel,
  Hospital,
  Shield,
  AlertTriangle,
  Utensils,
  CheckCircle2,
  Phone,
  Navigation,
  Clock,
} from 'lucide-react';

interface JourneyMilestonesTimelineProps {
  milestones: RouteMilestone[];
  selectedRouteName: string;
}

export const JourneyMilestonesTimeline: React.FC<JourneyMilestonesTimelineProps> = ({
  milestones,
  selectedRouteName,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#e5ebf3] p-5 sm:p-6 shadow-xs space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-[#0f1d32] uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#e84e5f]" />
            Detailed Step-by-Step Route Explanation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key locations, verified emergency safe hubs, and reported conditions along{' '}
            <strong className="text-slate-700">{selectedRouteName}</strong>.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-center">
          {milestones.length} Route Checkpoints
        </span>
      </div>

      {/* TIMELINE LIST */}
      <div className="relative pl-3 sm:pl-4 space-y-5 before:absolute before:left-[21px] sm:before:left-[25px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {milestones.map((ms, index) => {
          let badgeColor = 'bg-blue-600 text-white';
          let borderColor = 'border-blue-200';
          let Icon = MapPin;

          if (ms.type === 'start') {
            badgeColor = 'bg-[#0f1d32] text-white';
            borderColor = 'border-slate-300';
            Icon = Navigation;
          } else if (ms.type === 'transit') {
            badgeColor = 'bg-purple-600 text-white';
            borderColor = 'border-purple-200';
            Icon = Train;
          } else if (ms.type === 'fuel') {
            badgeColor = 'bg-amber-600 text-white';
            borderColor = 'border-amber-200';
            Icon = Fuel;
          } else if (ms.type === 'hospital') {
            badgeColor = 'bg-rose-600 text-white';
            borderColor = 'border-rose-200';
            Icon = Hospital;
          } else if (ms.type === 'police') {
            badgeColor = 'bg-blue-700 text-white';
            borderColor = 'border-blue-300';
            Icon = Shield;
          } else if (ms.type === 'hazard') {
            badgeColor = 'bg-orange-600 text-white';
            borderColor = 'border-orange-300';
            Icon = AlertTriangle;
          } else if (ms.type === 'amenity') {
            badgeColor = 'bg-emerald-600 text-white';
            borderColor = 'border-emerald-200';
            Icon = Utensils;
          } else if (ms.type === 'destination') {
            badgeColor = 'bg-[#e84e5f] text-white';
            borderColor = 'border-rose-300';
            Icon = CheckCircle2;
          }

          return (
            <div key={ms.id} className="relative flex items-start gap-3 sm:gap-4 group">
              {/* TIMELINE ICON NODE */}
              <div
                className={`w-8 h-8 rounded-full ${badgeColor} flex items-center justify-center shadow-md ring-4 ring-white shrink-0 z-10 transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* CARD DETAILS */}
              <div
                className={`flex-1 p-3.5 sm:p-4 rounded-2xl border bg-slate-50/70 hover:bg-slate-50 transition-colors ${borderColor} shadow-2xs`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* DISTANCE PILL */}
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-black text-[#0f1d32] shadow-2xs">
                      {ms.distanceFromStartKm === 0
                        ? '0.0 km (Start)'
                        : `${ms.distanceFromStartKm} km`}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-[#0f1d32] leading-tight">
                      {ms.title}
                    </h4>
                  </div>

                  {ms.openHours && (
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      {ms.openHours}
                    </span>
                  )}
                </div>

                {/* SAFETY NOTE */}
                {ms.safetyNote && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    {ms.safetyNote}
                  </p>
                )}

                {/* CALL OR ACTION BUTTON */}
                {ms.contactNumber && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Emergency / Desk Helpline:
                    </span>
                    <a
                      href={`tel:${ms.contactNumber.split('/')[0].trim()}`}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>{ms.contactNumber}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
