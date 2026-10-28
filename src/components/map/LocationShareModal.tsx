import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { locationService } from '../../services/locationService';
import { emergencyService } from '../../services/emergencyService';
import { X, Share2, Copy, Check, MessageSquare, Clock } from 'lucide-react';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationShareModal: React.FC<LocationShareModalProps> = ({ isOpen, onClose }) => {
  const { location, showToast } = useApp();
  const [duration, setDuration] = useState(60); // minutes
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = locationService.generateShareUrl(location, duration);
  const shareText = `📍 [Mecra Live GPS] I am sharing my live coordinates for safety: ${location.address}.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      showToast('Live location link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    const success = await locationService.shareLocationNative(
      'Mecra Live Location',
      shareText,
      shareUrl
    );
    if (success) {
      showToast('Shared location link successfully');
    }
  };

  const handleWhatsAppShare = () => {
    emergencyService.openWhatsApp('', `${shareText}\n${shareUrl}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 text-left">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-[#0f1d32] m-0">Share Live Location</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CURRENT LOCATION INFO */}
        <div className="p-3 bg-[#f8fafd] rounded-2xl border border-[#e5ebf3] mb-4">
          <span className="text-[10px] font-bold text-[#5b6b82] uppercase tracking-wider block">
            Current Anchor Point
          </span>
          <p className="text-xs font-bold text-[#0f1d32] mt-0.5 leading-snug">
            {location.address}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
            <span>Lat: {location.lat.toFixed(4)}</span>
            <span>•</span>
            <span>Lng: {location.lng.toFixed(4)}</span>
            <span>•</span>
            <span>Accuracy: ±{location.accuracy}m</span>
          </div>
        </div>

        {/* DURATION SELECTION */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[#0f1d32] flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Sharing Duration</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { val: 15, label: '15 Mins' },
              { val: 60, label: '1 Hour' },
              { val: 480, label: '8 Hours' },
              { val: 1440, label: 'Until Safe' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDuration(d.val)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                  duration === d.val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* SHARE LINK BOX */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-600 truncate">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* QUICK SHARE ACTIONS */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-3 px-4 rounded-xl bg-[#e84e5f] hover:bg-[#d33c4d] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>More Options</span>
          </button>
        </div>
      </div>
    </div>
  );
};
