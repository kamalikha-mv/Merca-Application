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
  const [newPriority, setNewPriority] = useState<1 | 2 | 3>(1);

  // Medical form local state
  const [medData, setMedData] = useState(medical);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addContact({
      name: newName,
      relation: newRelation || 'Trusted Contact',
      phone: newPhone,
      priority: newPriority,
      customTemplate: 'EMERGENCY: I need help at my current live location.',
    });

    setIsAddOpen(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
  };

  const handleSaveMedical = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedical(medData);
  };

  return (
    <div className="p-4 space-y-4 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between">
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
          { id: 'contacts', label: 'Contacts (3)' },
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
            <span className="text-xs font-bold text-[#0f1d32]">
              Emergency Escalation Order (P1 → P2 → P3)
            </span>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* CONTACTS CARDS */}
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white rounded-3xl border border-[#e5ebf3] shadow-2xs space-y-3 text-left"
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
                    emergencyService.openWhatsApp(
                      c.phone,
                      `[Mecra Safety Test] Hi ${c.name}, confirming your number is listed as my Priority ${c.priority} emergency contact.`
                    )
                  }
                  className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}

          {/* ADD CONTACT MODAL */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border text-left">
                <h3 className="text-base font-black text-[#0f1d32] mb-3">Add Emergency Contact</h3>
                <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Sarah Morgan"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      placeholder="e.g. Partner, Parent, Roommate"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1d32] block mb-1">Priority Rank</label>
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
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">Blood Type</label>
              <input
                type="text"
                value={medData.bloodType}
                onChange={(e) => setMedData({ ...medData, bloodType: e.target.value })}
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0f1d32] block mb-1">Primary Language</label>
              <input
                type="text"
                value={medData.primaryLanguage}
                onChange={(e) => setMedData({ ...medData, primaryLanguage: e.target.value })}
                className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Allergies</label>
            <input
              type="text"
              value={medData.allergies}
              onChange={(e) => setMedData({ ...medData, allergies: e.target.value })}
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Current Medications</label>
            <input
              type="text"
              value={medData.medications}
              onChange={(e) => setMedData({ ...medData, medications: e.target.value })}
              className="w-full p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-[#0f1d32]"
            />
          </div>

          <div>
            <label className="font-bold text-[#0f1d32] block mb-1">Emergency Notes for First Responders</label>
            <textarea
              rows={3}
              value={medData.emergencyNotes}
              onChange={(e) => setMedData({ ...medData, emergencyNotes: e.target.value })}
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
            <h3 className="text-sm font-black text-[#0f1d32]">Privacy & Architecture</h3>
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
