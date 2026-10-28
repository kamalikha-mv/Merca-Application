import React, { useState } from 'react';
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
    triggerEmergency,
    markUserSafe,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'ES' | 'HI' | 'FR' | 'TA'>('EN');

  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: `Hello! I am **Mecra Agentic AI Assistant**.
I am actively connected to your GPS (${location.address.split(',')[0]}), your Medical Emergency profile, and your Priority Contacts list.

You can speak or type in your situation naturally. I can execute emergency protocols, dispatch police station signals, find nearby hospital trauma centers, or share your live coordinates.`,
      timestamp: Date.now(),
      suggestions: [
        'I feel unsafe right now',
        'Medical emergency assistance',
        'Vehicle broke down',
        'Share live location',
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

    // Call Agentic AI Engine with Situational Context
    setTimeout(async () => {
      const response = await agenticAiService.processMessage(messageText, {
        location,
        medical,
        contacts,
        onTriggerEmergency: (cat) => triggerEmergency(cat, messageText),
        onResolveSafe: () => markUserSafe(),
      });

      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  const handleSpeak = (text: string) => {
    agenticAiService.speakInstruction(text);
    showToast('🔊 Speaking instructions aloud...');
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

        {/* LANGUAGE SWITCHER */}
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-[10px] font-bold">
          <Globe className="w-3 h-3 text-slate-400" />
          {(['EN', 'ES', 'HI'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                showToast(`Language set to ${lang}`);
              }}
              className={`px-1 rounded cursor-pointer ${
                language === lang ? 'bg-[#e84e5f] text-white' : 'text-slate-400'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES SCROLL AREA */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#f8fafd]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs border ${
                msg.sender === 'user'
                  ? 'bg-[#0f1d32] text-white border-slate-800 rounded-br-xs'
                  : 'bg-white text-[#0f1d32] border-[#e5ebf3] rounded-bl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 opacity-70 text-[10px]">
                <span className="font-bold uppercase">
                  {msg.sender === 'user' ? 'You' : 'Mecra Agent'}
                </span>
                {msg.sender === 'agent' && (
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    title="Speak text aloud"
                    className="hover:text-blue-600 cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                )}
              </div>

              <div className="whitespace-pre-line">{msg.text}</div>

              {/* TOOL EXECUTION BADGE IF APPLICABLE */}
              {msg.executedTool && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">
                      Agent Tool Executed: {msg.executedTool.name}()
                    </strong>
                    <span>{msg.executedTool.result}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SUGGESTION CHIPS */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                {msg.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] font-bold bg-white hover:bg-rose-50 text-[#e84e5f] border border-rose-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
                  >
                    {sug} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white p-2.5 rounded-2xl w-fit border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#e84e5f] animate-spin" />
            <span>Agent evaluating context and executing tools...</span>
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-[#e5ebf3] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your emergency or what you need..."
          className="flex-1 px-3.5 py-2.5 text-xs bg-[#f8fafd] border border-[#e5ebf3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e84e5f] text-[#0f1d32]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl bg-[#e84e5f] hover:bg-[#d33c4d] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
