import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AgentChatMessage } from '../../types';
import { agenticAiService } from '../../services/agenticAiService';
import {
  Bot,
  Send,
  Volume2,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Globe,
} from 'lucide-react';

export const AgenticChatbot: React.FC = () => {
  const {
    location,
    medical,
    contacts,
    emergencyStatus,
    activeAlert,
    activeBreakdown,
    activeJourney,
    triggerEmergency,
    markUserSafe,
    updateMedical,
    addContact,
    setActiveBreakdown,
    setActiveJourney,
    showToast,
  } = useApp();

  const locationHook = useLocation();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: `Hello! I am **Mecra Agentic AI Assistant**.
I am actively connected to your GPS (${location.town || location.address.split(',')[0]}), your Medical Emergency profile, and your Priority Contacts list.

You can instruct me naturally:
• *"Update my blood group to O+"*
• *"Add contact Priya with number 9840123456"*
• *"Help! I have a flat tyre on my car"*
• *"Help me calm down"* or *"Trigger SOS alert"*`,
      timestamp: Date.now(),
      suggestions: [
        'Where am I right now?',
        'Help me calm down',
        'Vehicle breakdown assistance',
        'Add an emergency contact',
      ],
    },
  ]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: AgentChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await agenticAiService.processMessage(messageText, {
        currentPage: locationHook.pathname,
        location,
        medical,
        contacts,
        emergencyStatus,
        activeAlert,
        activeBreakdown,
        activeJourney,
        onTriggerEmergency: (cat, note) => triggerEmergency(cat, note),
        onResolveSafe: () => markUserSafe(),
        onUpdateMedical: (med) => updateMedical(med),
        onAddContact: (c) => addContact(c),
        onSetActiveBreakdown: (req) => setActiveBreakdown(req),
        onSetActiveJourney: (j) => setActiveJourney(j),
        onNavigate: (path) => navigate(path),
      });

      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'agent',
          text: 'I am here with you. Your GPS is locked. Please tap the Emergency SOS button or tell me how I can assist.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text: string) => {
    agenticAiService.speakInstruction(text);
    showToast('🔊 Speaking instructions aloud...', 'info');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e5ebf3] shadow-md overflow-hidden flex flex-col h-[520px] text-left">
      {/* CHATBOT TOP BAR */}
      <div className="bg-[#101e33] p-3.5 px-4 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e84e5f] to-rose-400 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider uppercase">
                Mecra Agentic AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              Situational Emergency Agent · Active GPS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
            {location.town || 'Kilambakkam'}
          </span>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafd]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            } text-left`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-[#0f1d32] text-white rounded-br-xs'
                  : 'bg-white text-slate-800 border border-[#e5ebf3] rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* TOOL EXECUTION INDICATOR */}
              {m.executedTool && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{m.executedTool.result}</span>
                </div>
              )}

              {/* READ ALOUD BUTTON */}
              {m.sender === 'agent' && (
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 mt-1">
                  <span className="text-[9px] text-slate-400">Mecra AI • Verified</span>
                  <button
                    onClick={() => handleSpeak(m.text)}
                    title="Listen aloud"
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* QUICK SUGGESTIONS */}
            {m.suggestions && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-[#e5ebf3] text-[11px] font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-[#e5ebf3] rounded-2xl w-fit text-xs text-slate-500 font-bold shadow-2xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#e84e5f] animate-ping" />
            <span>AI is assessing your emergency context...</span>
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="p-3 bg-white border-t border-[#e5ebf3]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your emergency situation or command..."
            className="flex-1 p-2.5 bg-[#f8fafd] border border-[#e5ebf3] rounded-xl text-xs font-semibold text-[#0f1d32] focus:outline-none focus:border-[#e84e5f]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-[#0f1d32] hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
