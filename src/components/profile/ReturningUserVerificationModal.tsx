import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  HeartPulse,
  MapPin,
  CheckCircle2,
  Edit3,
  AlertCircle,
  Phone,
  Sparkles,
} from 'lucide-react';

interface ReturningUserVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const ReturningUserVerificationModal: React.FC<ReturningUserVerificationModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  const { contacts, medical, location, showToast } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleKeepProfile = () => {
    sessionStorage.setItem('merca_session_profile_verified', 'true');
    showToast('Emergency safety circle verified & armed for this session', 'success');
    onConfirm();
  };

  const handleUpdateProfile = () => {
    sessionStorage.setItem('merca_session_profile_verified', 'true');
    onConfirm();
    navigate('/profile');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-fadeIn"
    >
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh] text-left">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0f1d32] to-[#1c3254] text-white p-3.5 sm:p-5 relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-[#e84e5f]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shrink-0">
                M
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#e84e5f] uppercase bg-[#e84e5f]/15 px-2 py-0.5 rounded-full inline-block mb-0.5">
                  Welcome Back
                </span>
                <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                  Emergency Profile Verification
                </h2>
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Armed
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed relative z-10">
            Please review your preconfigured emergency contacts and medical profile. You can keep your existing profile or update details anytime.
          </p>
        </div>

        {/* BODY */}
        <div className="p-3.5 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {/* CURRENT OPERATIONAL GPS BASE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Active Crisis Calibration Hub
                </span>
                <strong className="text-xs font-black text-[#0f1d32] block">
                  {location.town || (location.address ? location.address.split(',')[0] : 'Kilambakkam Corridor')}
                </strong>
                <span className="text-[11px] text-slate-600 block">
                  {location.city || 'Chennai Metropolitan Area'} • {location.state || 'Tamil Nadu'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Precise GPS Active
            </span>
          </div>

          {/* EMERGENCY ESCALATION CIRCLE (ICE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0f1d32]">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Emergency Escalation Circle ({contacts.length})</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Tiered SOS Multi-Dispatch
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No emergency contacts saved:</strong> In an accident or threat, Mecra requires at least 2 trusted contacts to dispatch live alerts.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {contacts.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          c.priority === 1
                            ? 'bg-rose-100 text-[#e84e5f]'
                            : c.priority === 2
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        P{c.priority}
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#0f1d32] block">
                          {c.name}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {c.relation || 'Emergency Contact'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MEDICAL PROFILE SUMMARY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0f1d32]">
                <HeartPulse className="w-4 h-4 text-[#e84e5f]" />
                <span>Emergency Medical ID Card (108 Intake)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Name</span>
                <strong className="text-xs font-black text-[#0f1d32] truncate block">
                  {medical.fullName || 'Not specified'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Group</span>
                <strong className="text-xs font-black text-rose-600 block">
                  {medical.bloodType || 'Unset'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Known Allergies</span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {medical.allergies || 'None reported'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Critical Medical Notes</span>
                <span className="text-[11px] text-slate-700 block truncate">
                  {medical.severeHealthRisks || medical.emergencyNotes || 'Standard casualty protocol'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleKeepProfile}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#0f1d32] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Confirm & Keep Current Profile</span>
          </button>

          <button
            type="button"
            onClick={handleUpdateProfile}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#0f1d32] border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Update / Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

