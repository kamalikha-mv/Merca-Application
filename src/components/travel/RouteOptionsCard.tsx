import React from 'react';
import { RouteOption } from '../../types/travelSafety';
import {
  ShieldCheck,
  Zap,
  Navigation,
  Clock,
  Car,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';

interface RouteOptionsCardProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
}

export const RouteOptionsCard: React.FC<RouteOptionsCardProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  return (
    <div className="space-y-4">
      {/* SECTION HEADING */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[#0f1d32] uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Route Comparison & Recommendations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a route below to compare distance, travel time, verified surveillance, and reported road hazards.
          </p>
        </div>
      </div>

      {/* ROUTES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isRec = route.type === 'recommended';
          const isFast = route.type === 'fastest';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? isRec
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:-translate-y-0.5'
              }`}
            >
              <div>
                {/* TOP BADGES */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isRec
                        ? 'bg-emerald-100 text-emerald-800'
                        : isFast
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isRec ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        RECOMMENDED (SAFEST)
                      </>
                    ) : isFast ? (
                      <>
                        <Zap className="w-3 h-3 text-blue-700" />
                        FASTEST (BYPASS)
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 text-amber-700" />
                        SHORTEST DISTANCE
                      </>
                    )}
                  </span>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  )}
                </div>

                {/* ROUTE TITLE */}
                <h4 className="text-sm font-black text-[#0f1d32] leading-snug group-hover:text-blue-900 transition-colors">
                  {route.name}
                </h4>

                {/* STATS STRIP: TIME & DISTANCE */}
                <div className="flex items-center gap-3 mt-3 py-2 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                      Est. Time
                    </span>
                    <span className="text-base font-black text-[#0f1d32] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {route.durationMinutes} min
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                      Distance
                    </span>
                    <span className="text-base font-black text-[#0f1d32]">
                      {route.distanceKm} km
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                      Safety Score
                    </span>
                    <span
                      className={`text-base font-black ${
                        route.safetyScore >= 90
                          ? 'text-emerald-600'
                          : route.safetyScore >= 80
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {route.safetyScore}%
                    </span>
                  </div>
                </div>

                {/* WHY THIS ROUTE IS RECOMMENDED / RATIONALE */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-600" />
                    Why This Route:
                  </div>
                  <p className="font-medium text-slate-800">{route.recommendedReason}</p>
                </div>

                {/* KEY ROUTE FEATURES LIST */}
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Traffic Status:</span>
                    <span className="font-bold capitalize text-slate-800 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          route.trafficStatus === 'light'
                            ? 'bg-emerald-500'
                            : route.trafficStatus === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {route.trafficStatus} {route.trafficDelayMinutes > 0 ? `(+${route.trafficDelayMinutes}m delay)` : '(Zero Delay)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Road Quality:</span>
                    <span className="font-bold capitalize text-slate-800">{route.roadQuality} condition</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Streetlighting:</span>
                    <span className="font-bold text-slate-800">{route.lightingPercentage}% illuminated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">CCTV & Police:</span>
                    <span className="font-bold text-slate-800">{route.cctvSurveillance} CCTV</span>
                  </div>
                </div>

                {/* REPORTED HAZARDS */}
                {route.hazardsSummary.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Reported Caution Spots:
                    </span>
                    <ul className="space-y-1">
                      {route.hazardsSummary.map((h, i) => (
                        <li key={i} className="text-[11px] text-slate-600 leading-tight flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SELECT BUTTON */}
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? isRec
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Route Selected</span>
                    </>
                  ) : (
                    <span>Select This Route</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MANDATORY PROMINENT SAFETY DISCLAIMER */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-950 font-bold">Important Safety Notice:</strong>
          <span>
            Mecra analyses verified police logs, highway sensors, and community advisories to compute safety scores.
            However, real-world conditions can evolve rapidly. <strong>No route can be guaranteed 100% risk-free.</strong> Always maintain situational awareness, trust your instincts, and use Mecra's one-touch SOS in an emergency.
          </span>
        </div>
      </div>
    </div>
  );
};
