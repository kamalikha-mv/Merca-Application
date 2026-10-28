import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SafetyAdvisory } from '../../types';
import { localDb } from '../../services/storage';
import {
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  PlusCircle,
  Clock,
  MapPin,
  Check,
  X,
  Compass,
} from 'lucide-react';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const SafetyAdvisoriesModule: React.FC = () => {
  const { showToast } = useApp();
  const [advisories, setAdvisories] = useState<SafetyAdvisory[]>(() => localDb.getAdvisories());
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form state for user-submitted report
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSeverity, setNewSeverity] = useState<'low' | 'moderate' | 'high'>('moderate');

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const added = localDb.addAdvisory({
      title: newTitle,
      type: 'community_report',
      severity: newSeverity,
      description: newDescription,
      source: 'User-Submitted Incident (Pending Field Verification)',
      verified: false,
      locationName: newLocation || 'Near Current Location',
      distanceKm: 0.5,
    });

    setAdvisories(localDb.getAdvisories());
    setIsSubmitOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewLocation('');
    showToast('Community hazard report logged! Marked as Unverified Report for safety.');
  };

  const getSeverityPill = (sev: SafetyAdvisory['severity']) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return 'bg-rose-100 text-[#e84e5f] border-rose-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-4 space-y-4 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
            REAL-TIME HAZARD AWARENESS
          </span>
          <h2 className="text-xl font-black text-[#0f1d32] m-0">Safety Advisories</h2>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0f1d32] hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Report Hazard</span>
        </button>
      </div>

      {/* ADVISORIES LIST */}
      <div className="space-y-3">
        {advisories.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-3xl border text-left space-y-2.5 transition-all shadow-2xs ${
              item.verified
                ? 'bg-white border-[#e5ebf3] hover:shadow-xs'
                : 'bg-amber-50/60 border-amber-300'
            }`}
          >
            {/* TOP BAR */}
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityPill(
                  item.severity
                )}`}
              >
                {item.severity} severity
              </span>

              {item.verified ? (
                <HonestStatusBadge type="verified" label="OFFICIAL VERIFIED" />
              ) : (
                <HonestStatusBadge type="simulation" label="UNVERIFIED COMMUNITY REPORT" />
              )}
            </div>

            {/* TITLE & DESCRIPTION */}
            <div>
              <h3 className="text-sm font-black text-[#0f1d32] leading-snug m-0">
                {item.title}
              </h3>
              <p className="text-xs text-[#5b6b82] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* METADATA */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate max-w-[160px]">{item.locationName}</span>
              </span>

              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{item.reportedDate}</span>
              </span>
            </div>

            <div className="text-[10px] text-slate-400 italic">
              Source: {item.source}
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT COMMUNITY HAZARD MODAL */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#0f1d32] m-0">
                  Report Community Hazard
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#0f1d32] block mb-1">Hazard Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight, flooded ditch, road blockage..."
                  className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0f1d32] block mb-1">Location / Landmark</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Near Bus Stand 4, Corner of 2nd Street..."
                  className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0f1d32] block mb-1">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'moderate', 'high'] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewSeverity(s)}
                      className={`py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] border cursor-pointer ${
                        newSeverity === s
                          ? 'bg-[#0f1d32] text-white border-[#0f1d32]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0f1d32] block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide helpful context for others passing by..."
                  className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-snug">
                ⚠️ All community reports are tagged as <strong>Unverified</strong> until reviewed
                to prevent false alarms.
              </p>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-98"
              >
                Submit Hazard Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
