import React from 'react';

interface ChatMessageContentProps {
  text: string;
  isUser?: boolean;
}

// Parses and renders markdown (bold, quotes, bullets, steps, quotes) cleanly without exposing raw markdown syntax
export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ text, isUser = false }) => {
  if (isUser) {
    return <div className="text-xs leading-relaxed font-medium whitespace-pre-wrap">{text}</div>;
  }

  // Helper to format inline tokens: **bold**, *"quotes"*, and `code`
  const renderInlineFormatted = (rawText: string) => {
    // Regex splits by: **bold**, *"speech quote"*, or "quote"
    const parts = rawText.split(/(\*\*[^*]+?\*\*|\*["'].+?["']\*|"[^"]+?")/g);

    return parts.map((part, index) => {
      // Bold token: **bold text**
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#0f1d32]">
            {content}
          </strong>
        );
      }

      // Speech Quote: *"Update my blood group..."* or "..."
      if (
        (part.startsWith('*') && part.endsWith('*')) ||
        (part.startsWith('"') && part.endsWith('"') && part.length > 3)
      ) {
        const clean = part.replace(/^[*"']+|[*"']+$/g, '');
        return (
          <span
            key={index}
            className="inline-block mx-1 my-0.5 px-2 py-0.5 rounded-lg bg-blue-50/90 border border-blue-200/80 text-blue-950 font-semibold text-[11px]"
          >
            "{clean}"
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Split message into paragraphs and structured lines
  const lines = text.split('\n');

  return (
    <div className="text-xs text-slate-800 space-y-2 leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // 1. Blockquote (Grounding / Panic reassurance quote)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={lineIdx}
              className="p-3 my-2 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 rounded-2xl border-l-4 border-blue-500 text-blue-950 text-xs italic font-medium shadow-2xs"
            >
              {renderInlineFormatted(quoteText)}
            </div>
          );
        }

        // 2. Numbered steps (e.g. 1. Inhale..., 2. Hold...)
        const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (stepMatch) {
          const stepNum = stepMatch[1];
          const stepContent = stepMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 py-0.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {stepNum}
              </span>
              <div className="flex-1 font-medium">{renderInlineFormatted(stepContent)}</div>
            </div>
          );
        }

        // 3. Bullet items (• or -)
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const bulletContent = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div
              key={lineIdx}
              className="flex items-start gap-2 py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#e84e5f] shrink-0 mt-2" />
              <div className="flex-1 text-[11.5px] leading-snug">
                {renderInlineFormatted(bulletContent)}
              </div>
            </div>
          );
        }

        // 4. Alert / Header banners (e.g. 🚨 Urgent, 🌬️ Breathe, ✅ Updated, 🚗 Roadside, 🛡️ Guardian)
        if (/^(🚨|🌬️|✅|🚗|🛡️|📍|⚠️)/.test(trimmed)) {
          return (
            <div
              key={lineIdx}
              className="font-black text-sm text-[#0f1d32] pt-1 pb-0.5 flex items-center gap-1.5"
            >
              {renderInlineFormatted(trimmed)}
            </div>
          );
        }

        // Standard prose paragraph
        return (
          <p key={lineIdx} className="font-medium text-[12px] leading-relaxed">
            {renderInlineFormatted(line)}
          </p>
        );
      })}
    </div>
  );
};
