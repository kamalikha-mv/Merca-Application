import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { localDb } from '../../services/storage';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  X,
  AlertTriangle,
  Phone,
  MapPin,
  HeartPulse,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface IncidentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentType?: string;
}

export const IncidentReportCardModal: React.FC<IncidentReportCardModalProps> = ({
  isOpen,
  onClose,
  incidentType = 'Emergency Incident',
}) => {
  const { location, contacts, showToast } = useApp();
  const medical = localDb.getMedical();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const incidentTimestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
  const incidentId = 'MECRA-INC-' + Date.now().toString().slice(-6);

  const handleCopySummary = () => {
    const text = `
🚨 MECRA OFFICIAL INCIDENT PATIENT CARD
Incident ID: ${incidentId}
Timestamp: ${incidentTimestamp}
Type: ${incidentType}
Location: ${location.address} (GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})

PATIENT MEDICAL INFORMATION:
- Full Name: ${medical.fullName}
- Blood Group: ${medical.bloodType}
- Severe Risks: ${medical.severeHealthRisks || 'None reported'}
- Known Allergies: ${medical.allergies || 'None'}
- Current Medications: ${medical.medications || 'None'}
- Home Town: ${medical.cityTown || (location.town ? location.town : 'Kilambakkam')}

ICE EMERGENCY CONTACTS:
${contacts.map((c, i) => `P${i + 1}: ${c.name} (${c.relation}) - ${c.phone}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('Patient Incident Card copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* MODAL HEADER */}
        <div className="bg-[#0f1d32] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-black text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight uppercase">
                Emergency Incident Patient Card
              </h3>
              <p className="text-[11px] text-slate-300">
                Official First-Responder Intake Summary for Ambulance (108) & Police (112)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE CARD CONTENT */}
        <div ref={printRef} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-white">
          {/* HEADER METADATA */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                INCIDENT REFERENCE
              </span>
              <span className="text-sm font-black text-[#0f1d32] tracking-wider font-mono">
                {incidentId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#e84e5f] text-xs font-black uppercase">
                {incidentType}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {incidentTimestamp}
              </span>
            </div>
          </div>

          {/* PATIENT VITAL INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* BLOOD GROUP CARD - LARGE HIGHLIGHT */}
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-black text-[#e84e5f] uppercase tracking-wider">
                BLOOD GROUP
              </span>
              <span className="text-3xl font-black text-[#0f1d32] mt-1">
                {medical.bloodType || 'O+'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                Organ Donor: {medical.organDonor ? 'Yes' : 'No'}
              </span>
            </div>

            {/* NAME & GENERAL */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Patient Full Name
                </span>
                <h4 className="text-base font-black text-[#0f1d32] mt-0.5">
                  {medical.fullName || 'Registered User'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">City / Town</span>
                  <strong className="text-slate-800">{medical.cityTown || (location.town ? location.town : 'Local District')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Language</span>
                  <strong className="text-slate-800">{medical.primaryLanguage || 'Tamil, English'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL MEDICAL RISKS & ALLERGIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-1.5 text-amber-800 font-black uppercase text-[11px] mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Severe Health Risks / Conditions
              </div>
              <p className="text-slate-800 font-semibold leading-relaxed">
                {medical.severeHealthRisks || 'None reported on emergency file.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 font-black uppercase text-[11px] mb-1">
                <HeartPulse className="w-3.5 h-3.5 text-[#e84e5f]" />
                Known Allergies & Medication
              </div>
              <p className="text-slate-800 font-semibold leading-relaxed">
                <strong>Allergies:</strong> {medical.allergies || 'None'}<br />
                <strong>Medications:</strong> {medical.medications || 'None'}
              </p>
            </div>
          </div>

          {/* INCIDENT GPS LOCATION */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xs flex-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Incident Location & GPS Coordinates
              </span>
              <p className="text-[#0f1d32] font-semibold mt-0.5">{location.address}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 font-mono">
                <span>Lat: {location.lat.toFixed(5)}° N</span>
                <span>•</span>
                <span>Lng: {location.lng.toFixed(5)}° E</span>
                <span>•</span>
                <span>Accuracy: ±{location.accuracy}m</span>
              </div>
            </div>
          </div>

          {/* ICE CONTACTS */}
          <div>
            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              ICE Emergency Contacts
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {contacts.map((c, i) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-[#e84e5f] uppercase tracking-wider">
                    Priority {i + 1} ({c.relation})
                  </span>
                  <div className="font-bold text-[#0f1d32]">{c.name}</div>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Incident Summary</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Intake Card</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0f1d32] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
