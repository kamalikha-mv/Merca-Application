import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrustedContact } from '../../types';
import {
  Users,
  Plus,
  Phone,
  MessageSquare,
  Trash2,
  Edit2,
  HeartPulse,
  Shield,
  Save,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

export const ContactsManager: React.FC = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    medical,
    updateMedical,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contacts' | 'medical' | 'privacy'>('contacts');

  // New Contact Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPriority, setNewPriority] = useState<1 | 2 | 3>(
    (Math.min(3, contacts.length + 1) as 1 | 2 | 3) || 1
  );

  // Medical form local state
  const [medData, setMedData] = useState(medical);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('Please enter both contact name and phone number', 'error');
      return;
    }

    addContact({
      name: newName.trim(),
      relation: newRelation.trim() || 'Emergency Contact',
      phone: newPhone.trim(),
      priority: newPriority,
      customTemplate: 'EMERGENCY: Urgent assistance needed at my live location.',
    });

    setIsAddOpen(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    showToast(`Added ${newName} to emergency circle`, 'success');
  };

  const handleSaveMedical = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedical(medData);
    showToast('Medical Emergency ID updated successfully', 'success');
  };

  return (
    <div className="p-4 space-y-4 text-left">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase block">
            PRECONFIGURED RESPONSE PLAN
          </span>
          <h2 className="text-xl font-black text-[#0f1d32] m-0">Safety & ID Setup</h2>
        </div>
        <HonestStatusBadge type="verified" label="LOCAL ENCRYPTED" />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        {[
          { id: 'contacts', label: `Contacts (${contacts.length})` },
          { id: 'medical', label: 'Medical ID' },
          { id: 'privacy', label: 'Security' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-white text-[#0f1d32] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TRUSTED CONTACTS LIST */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#0f1d32] block">
                Emergency Escalation Circle (Min 2 Required)
              </span>
              <span className="text-[11px] text-slate-500">
                Escalates from Priority 1 to Priority 2 and 3 automatically during SOS.
              </span>
            </div>
            {contacts.length < 3 && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>

          {/* MINIMUM CONTACTS WARNING / CONFIRMATION BADGE */}
          {contacts.length < 2 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Incomplete Safety Circle:</strong> You currently have {contacts.length} contact configured. At least <strong>2 emergency contacts</strong> are required to ensure continuous backup escalation.
              </span>
            </div>
          )}

          {contacts.length >= 2 && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Safety Circle Armed:</strong> {contacts.length} verified contacts configured for multi-tier emergency dispatch.
              </span>
            </div>
          )}

          {/* EMPTY STATE IF NO CONTACTS ADDED */}
          {contacts.length === 0 && (
            <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0f1d32]">No Emergency Contacts Added</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  You haven't configured any emergency contacts yet. In a crisis or accident, Mecra needs at least 2 trusted contacts to dispatch live alerts and GPS coordinates.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Emergency Contact</span>
              </button>
            </div>
          )}

          {/* CONTACTS CARDS */}
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white rounded-3xl border border-[#e5ebf3] shadow-xs space-y-3 text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        c.priority === 1
                          ? 'bg-rose-100 text-[#e84e5f]'
                          : c.priority === 2
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      Priority {c.priority}
                    </span>
                    <strong className="text-sm font-black text-[#0f1d32]">{c.name}</strong>
                  </div>
                  <span className="text-[11px] text-[#5b6b82] block mt-0.5">
                    {c.relation} • {c.phone}
                  </span>
                </div>

                <button
                  onClick={() => deleteContact(c.id)}
                  title="Remove contact"
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* ACTION LINKS */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => emergencyService.callNumber(c.phone)}
                  className="flex-1 py-2 rounded-xl bg-[#f8fafd] hover:bg-slate-100 text-[#0f1d32] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#e5ebf3] cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call</span>
                </button>

                <button
                  onClick={() =>
                    emergencyService.openSmsApp(
                      c.phone,
                      c.customTemplate || 'EMERGENCY: Urgent help needed at my location.'
                    )
                  }
                  className="flex-1 py-2 rounded-xl bg-[#f8fafd] hover:bg-slate-100 text-[#0f1d32] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#e5ebf3] cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          ))}

          {/* ADD CONTACT MODAL / DRAWER */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-[#0f1d32]">Add Emergency Contact</h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter Name"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      placeholder="Enter Relation (e.g. Spouse / Brother)"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Mobile Phone Number</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter Mobile Number (+91 ...)"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Priority Order</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setNewPriority(p as any)}
                          className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                            newPriority === p
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Priority {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Save Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAL ID */}
      {activeTab === 'medical' && (
        <form
          onSubmit={handleSaveMedical}
          className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4 text-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-black text-[#0f1d32]">Emergency Medical Information</h3>
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Full Legal Name</label>
            <input
              type="text"
              value={medData.fullName}
              onChange={(e) => setMedData({ ...medData, fullName: e.target.value })}
              placeholder="Enter Full Legal Name"
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">Blood Group</label>
              <select
                value={medData.bloodType}
                onChange={(e) => setMedData({ ...medData, bloodType: e.target.value })}
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              >
                <option value="">-- Select Blood Group --</option>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">Primary Language</label>
              <input
                type="text"
                value={medData.primaryLanguage}
                onChange={(e) => setMedData({ ...medData, primaryLanguage: e.target.value })}
                placeholder="Enter Primary Language (e.g. Tamil, English)"
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Severe Health Risks / Chronic Conditions</label>
            <input
              type="text"
              value={medData.severeHealthRisks || ''}
              onChange={(e) => setMedData({ ...medData, severeHealthRisks: e.target.value })}
              placeholder="Enter Chronic Risks (e.g. Asthma, Cardiac, Diabetes, or 'None')"
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">Allergies</label>
              <input
                type="text"
                value={medData.allergies}
                onChange={(e) => setMedData({ ...medData, allergies: e.target.value })}
                placeholder="Enter Allergies (or 'None')"
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">City / Town</label>
              <input
                type="text"
                value={medData.cityTown || ''}
                onChange={(e) => setMedData({ ...medData, cityTown: e.target.value })}
                placeholder="Enter City / Town (e.g. Current District or City)"
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Current Medications</label>
            <input
              type="text"
              value={medData.medications}
              onChange={(e) => setMedData({ ...medData, medications: e.target.value })}
              placeholder="Enter Current Medications (or 'None')"
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Emergency Notes for First Responders</label>
            <textarea
              rows={3}
              value={medData.emergencyNotes}
              onChange={(e) => setMedData({ ...medData, emergencyNotes: e.target.value })}
              placeholder="Enter instructions for paramedics or police (e.g. Inhaler location, pacemaker, ICE contact)"
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Save Medical Emergency ID</span>
          </button>
        </form>
      )}

      {/* TAB 3: PRIVACY & DATA SECURITY */}
      {activeTab === 'privacy' && (
        <div className="bg-white p-5 rounded-3xl border border-[#e5ebf3] shadow-xs space-y-4 text-xs text-[#0f1d32]">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-[#0f1d32]">Privacy & Security Architecture</h3>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 leading-relaxed space-y-1">
            <strong className="block font-bold">Client-Side Zero-Cloud Storage:</strong>
            All emergency contacts, medical records, and location logs are stored locally on your device via structured JSON Web Storage.
          </div>

          <div className="space-y-2 text-slate-600 leading-relaxed text-[11px]">
            <p>• <strong>GPS Permission:</strong> Location coordinates are only read upon explicit user trigger or active journey monitoring.</p>
            <p>• <strong>No Unsolicited Tracking:</strong> No background location tracking runs when the application is idle.</p>
            <p>• <strong>Transparent Simulation:</strong> Calls and dispatches are visually demonstrated with real device dialer integration.</p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Delete all stored contacts, medical records and emergency logs?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full py-3 bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 cursor-pointer transition-colors"
          >
            Clear All Data from Device
          </button>
        </div>
      )}
    </div>
  );
};
