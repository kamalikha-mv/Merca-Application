import React from 'react';
import { SafetyAnalytics } from '../../types/travelSafety';
import {
  ShieldAlert,
  AlertTriangle,
  CloudSun,
  Cone,
  Waves,
  Radio,
  Clock,
  EyeOff,
  CheckCircle2,
  FileText,
  Building2,
} from 'lucide-react';

interface SafetyAnalyticsSectionProps {
  safety: SafetyAnalytics;
  lastUpdatedSource: string;
}

export const SafetyAnalyticsSection: React.FC<SafetyAnalyticsSectionProps> = ({
  safety,
  lastUpdatedSource,
}) => {
  return (
    <div className="space-y-4">
      {/* SECTION HEADER & SOURCE CHIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-[#0f1d32] uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            Verified Safety & Threat Intelligence
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time highway police feeds, blackspots, meteorological advisories, and historical logs.
          </p>
        </div>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-center flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>{lastUpdatedSource}</span>
        </div>
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CRIME STATISTICS & HISTORICAL LOGS */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                  Crime Index & Incident History
                </h4>
                <span className="text-[10px] text-slate-500">Official State Police Records</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Risk: {safety.crimeStats.level} ({safety.crimeStats.score}/10)
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {safety.crimeStats.description}
          </p>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patrol Frequency:</span>
              <strong className="text-slate-800">{safety.crimeStats.patrolFrequency}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Historical Incidents (180d):</span>
              <strong className="text-slate-800">
                {safety.crimeStats.historicalIncidentsCount} Verified Record
              </strong>
            </div>
            <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200">
              Note: {safety.crimeStats.lastReportedDate}
            </div>
          </div>
        </div>

        {/* WEATHER & VISIBILITY WARNINGS */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                  Weather & Driving Visibility
                </h4>
                <span className="text-[10px] text-slate-500">Regional Met Telemetry</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              {safety.weather.temperatureCelsius}°C • {safety.weather.condition}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {safety.weather.alertText}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Sightline</span>
              <strong className="text-xs text-slate-800">{safety.weather.visibilityKm} km</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Rain Risk</span>
              <strong className="text-xs text-slate-800">{safety.weather.rainProbability}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Wind</span>
              <strong className="text-xs text-slate-800">{safety.weather.windSpeedKmH} km/h</strong>
            </div>
          </div>
        </div>

        {/* ACCIDENT BLACKSPOTS */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#e84e5f] flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                Identified Accident Blackspots ({safety.accidentBlackspots.length})
              </h4>
              <span className="text-[10px] text-slate-500">Highway Authority Crash Mapping</span>
            </div>
          </div>

          <div className="space-y-2">
            {safety.accidentBlackspots.map((spot) => (
              <div
                key={spot.id}
                className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-rose-950 font-extrabold">{spot.locationName}</strong>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                    {spot.kmMarker}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  <span className="font-semibold text-rose-900">Risk Factor:</span> {spot.riskFactor}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  💡 <span className="font-semibold">Advisory:</span> {spot.advisory}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ROAD CLOSURES & CONSTRUCTION */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Cone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                Active Construction & Diversions
              </h4>
              <span className="text-[10px] text-slate-500">Live Traffic Control Updates</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {safety.constructionZones.map((cz) => (
              <div
                key={cz.id}
                className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-amber-950 font-extrabold">{cz.stretch}</strong>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                    Speed: {cz.speedLimitKmH} km/h
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  <span className="font-semibold">Expected Impact:</span> {cz.expectedDelay}
                </p>
              </div>
            ))}

            {safety.roadClosures.map((rc) => (
              <div
                key={rc.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1"
              >
                <strong className="text-slate-900 font-extrabold">{rc.stretch}</strong>
                <p className="text-[11px] text-slate-600">{rc.reason}</p>
                <p className="text-[11px] text-emerald-800 font-semibold">{rc.alternateAdvice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FLOOD-PRONE AREAS */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                Flood-Prone Culverts & Subways
              </h4>
              <span className="text-[10px] text-slate-500">Waterlogging Sensors</span>
            </div>
          </div>

          {safety.floodProneAreas.map((fp) => (
            <div
              key={fp.id}
              className="p-3 rounded-2xl bg-cyan-50/50 border border-cyan-200 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <strong className="text-cyan-950 font-extrabold">{fp.areaName}</strong>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {fp.currentStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {fp.monsoonVulnerability}
              </p>
            </div>
          ))}
        </div>

        {/* ISOLATED ROUTE SECTIONS */}
        <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0f1d32] uppercase tracking-wide">
                Isolated / Sparsely Inhabited Stretches
              </h4>
              <span className="text-[10px] text-slate-500">Remote Corridor Assessment</span>
            </div>
          </div>

          {safety.isolatedSections.map((is) => (
            <div
              key={is.id}
              className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <strong className="text-purple-950 font-extrabold">
                  KM {is.startKm} to KM {is.endKm} Buffer Section
                </strong>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px]">
                  Lighting: {is.lighting}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">{is.description}</p>
              <div className="pt-1 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Action: {is.recommendedAction}</span>
                {is.emergencyPhoneAvailable && (
                  <span className="font-bold text-emerald-700">SOS Phone: Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICIAL SAFETY ALERTS NOTIFICATION BANNER */}
      {safety.officialAlerts.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0f1d32] to-[#1c3254] text-white shadow-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
            <Radio className="w-4 h-4" />
            <span>Official Police & Highway Command Broadcasts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {safety.officialAlerts.map((oa) => (
              <div key={oa.id} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <strong className="text-white font-bold">{oa.agency}</strong>
                  <span>{oa.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">{oa.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
