import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { agenticAiService, AgentContext } from '../../services/agenticAiService';
import { AgentChatMessage } from '../../types';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  CornerDownLeft,
  Heart,
  MessageSquare,
  Wrench,
  Compass,
  UserCheck,
} from 'lucide-react';

export const GlobalAiAgentDrawer: React.FC = () => {
  const {
    location,
    emergencyStatus,
    activeAlert,
    medical,
    contacts,
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

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: `Hello! I am **Mecra Agentic AI**, connected live to your location, forms, and emergency protocols across the entire app.

I can actively help you:
• **Fill forms:** *"Update my blood group to O+ and name to Rahul"*
• **Add contacts:** *"Add contact Priya, relation spouse, phone 9840123456"*
• **Roadside help:** *"I have a flat tyre on my scooter"*
• **Safe journey:** *"Start trip to Tambaram for 25 mins"*
• **Panic guidance:** *"Help me calm down"* or *"Trigger SOS alert"*

How can I assist you right now?`,
      timestamp: Date.now(),
      suggestions: [
        'Where am I right now?',
        'Breathe with Mecra (Calm)',
        'Vehicle breakdown assistance',
        'Add an emergency contact',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser.', 'info');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      showToast('Listening... Speak your emergency instruction', 'info');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputText).trim();
    if (!messageText || isProcessing) return;

    const userMsg: AgentChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    const context: AgentContext = {
      currentPage: locationHook.pathname,
      location,
      emergencyStatus,
      activeAlert,
      medical,
      contacts,
      activeBreakdown,
      activeJourney,
      onTriggerEmergency: (cat, note) => triggerEmergency(cat, note),
      onResolveSafe: () => markUserSafe(),
      onUpdateMedical: (med) => updateMedical(med),
      onAddContact: (c) => addContact(c),
      onSetActiveBreakdown: (req) => setActiveBreakdown(req),
      onSetActiveJourney: (j) => setActiveJourney(j),
      onNavigate: (path) => navigate(path),
    };

    try {
      const response = await agenticAiService.processMessage(messageText, context);
      setMessages((prev) => [...prev, response]);

      if (voiceEnabled) {
        agenticAiService.speakInstruction(response.text);
      }
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
      setIsProcessing(false);
    }
  };

  const isEmergencyActive = emergencyStatus === 'DISPATCHED';

  return (
    <>
      {/* FLOATING ACTION BUTTON (BOTTOM-LEFT REGION AS REQUESTED) */}
      <button
        onClick={() => setIsOpen(true)}
        title="Open Mecra AI Agent"
        className={`fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 ${
          isEmergencyActive
            ? 'bg-[#e84e5f] text-white border-2 border-white animate-pulse'
            : 'bg-[#0f1d32] text-white hover:bg-slate-900 border border-slate-700/80'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#e84e5f]" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight leading-none">MECRA AI</span>
            <span className="text-[9px] bg-rose-500/30 text-rose-300 font-bold px-1.5 py-0.2 rounded-sm uppercase">
              Agent
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium block mt-0.5 leading-none">
            {isEmergencyActive ? 'Crisis Mode Active' : 'Autonomous Helper'}
          </span>
        </div>
      </button>

      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* SLIDE-OUT AGENTIC SIDE PANEL DRAWER */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-slate-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* DRAWER TOP BAR */}
        <div className="p-4 sm:p-5 bg-[#0f1d32] text-white flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-[#e84e5f]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-1.5">
                  <span>Mecra Autonomous AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">
                  Full Access Crisis & Form Filling Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* VOICE TOGGLE */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE APPLICATION STATE CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 relative z-10 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 shrink-0">
              📍 {location.town || 'Kilambakkam'} (±{location.accuracy}m)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 shrink-0">
              👥 {contacts.length} Contacts
            </span>
            {isEmergencyActive ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white shrink-0 animate-pulse">
                🚨 SOS ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 shrink-0">
                ✓ Normal Watch
              </span>
            )}
          </div>
        </div>

        {/* QUICK ACTION CHIPS */}
        <div className="p-2.5 bg-[#f8fafd] border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { label: 'Calm Me Down 🌬️', action: () => handleSendMessage('Help me calm down') },
            { label: 'Where Am I? 📍', action: () => handleSendMessage('Where am I right now?') },
            { label: 'Add Contact 👥', action: () => handleSendMessage('I want to add an emergency contact') },
            { label: 'Fill Medical ID 🩺', action: () => handleSendMessage('Help me fill my medical profile') },
            { label: 'Flat Tyre / Breakdown 🚗', action: () => handleSendMessage('I have a vehicle breakdown') },
            { label: 'Start Trip 🛡️', action: () => handleSendMessage('Start guardian tracking for my journey') },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={chip.action}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#0f1d32] shrink-0 cursor-pointer shadow-2xs transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              } text-left`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0f1d32] text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {/* MESSAGE TEXT */}
                <div className="whitespace-pre-line font-medium">{msg.text}</div>

                {/* TOOL EXECUTION INDICATOR */}
                {msg.executedTool && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{msg.executedTool.result}</span>
                  </div>
                )}

                {/* READ ALOUD BUTTON */}
                {msg.sender === 'agent' && (
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 mt-1">
                    <span className="text-[9px] text-slate-400">Mecra AI • Verified</span>
                    <button
                      onClick={() => agenticAiService.speakInstruction(msg.text)}
                      title="Listen"
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* QUICK SUGGESTION PILLS */}
              {msg.suggestions && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-xs text-slate-500 font-bold shadow-2xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#e84e5f] animate-ping" />
              <span>Mecra AI is accessing app context & executing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* SPEECH MIC BUTTON */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI or instruct: 'Add contact...', 'I have a flat tyre'..."
              className="flex-1 p-2.5 bg-[#f8fafd] border border-slate-200 rounded-xl text-xs font-semibold text-[#0f1d32] focus:outline-none focus:border-[#e84e5f]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-2.5 bg-[#0f1d32] hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
