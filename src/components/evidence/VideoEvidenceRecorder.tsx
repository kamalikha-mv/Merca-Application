import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { evidenceService } from '../../services/evidenceService';
import { localDb } from '../../services/storage';
import { emergencyService } from '../../services/emergencyService';
import { VideoEvidenceRecord } from '../../types';
import {
  Video,
  Mic,
  Square,
  Play,
  Download,
  Share2,
  Trash2,
  AlertCircle,
  ShieldAlert,
  Clock,
  X,
  MapPin,
  CheckCircle2,
  SwitchCamera,
  ShieldCheck,
  Send,
  FileText,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { HonestStatusBadge } from '../common/HonestStatusBadge';

interface VideoEvidenceRecorderProps {
  isOpen?: boolean;
  onClose?: () => void;
  incidentType?: string;
  isStandalonePage?: boolean;
}

export const VideoEvidenceRecorder: React.FC<VideoEvidenceRecorderProps> = ({
  isOpen = true,
  onClose,
  incidentType = 'Safety Threat / Incident',
  isStandalonePage = false,
}) => {
  const { location, contacts, showToast } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [latestSavedRecord, setLatestSavedRecord] = useState<VideoEvidenceRecord | null>(null);
  const [records, setRecords] = useState<VideoEvidenceRecord[]>(() =>
    localDb.getEvidenceRecords()
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedRecordForShare, setSelectedRecordForShare] = useState<VideoEvidenceRecord | null>(null);

  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);

  // Initialize camera preview on mount or when camera direction flips
  useEffect(() => {
    let isCancelled = false;

    const startPreview = async () => {
      setCameraError(null);
      try {
        const previewStream = await evidenceService.getCameraPreview(facingMode);
        if (!isCancelled) {
          setStream(previewStream);
          if (videoLiveRef.current) {
            videoLiveRef.current.srcObject = previewStream;
            videoLiveRef.current.play().catch(() => {});
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setCameraError(
            'Camera/Microphone permission requested. Tap "Start Recording" or check browser camera permissions.'
          );
        }
      }
    };

    if (isOpen && !recordedUrl) {
      startPreview();
    }

    return () => {
      isCancelled = true;
      if (!isRecording) {
        evidenceService.cleanUpStreams();
      }
    };
  }, [facingMode, isOpen, recordedUrl]);

  // Clean up hardware streams on unmount
  useEffect(() => {
    return () => {
      evidenceService.cleanUpStreams();
    };
  }, []);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Flip between rear environment camera and front selfie camera
  const handleToggleCamera = () => {
    if (isRecording) {
      showToast('Cannot switch camera while recording is in progress', 'info');
      return;
    }
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    showToast(`Switched to ${nextMode === 'environment' ? 'Rear' : 'Front'} Camera`, 'info');
  };

  const handleStartRecording = async () => {
    setCameraError(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setSelectedRecordForShare(null);
    try {
      const activeStream = await evidenceService.startRecording(
        facingMode,
        (secs) => setDuration(secs),
        () => handleStopRecording()
      );
      setStream(activeStream);
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = activeStream;
        videoLiveRef.current.play().catch(() => {});
      }
      setIsRecording(true);
      showToast('🔴 Evidence recording active: GPS & Timestamp watermark embedded', 'info');
    } catch (err: any) {
      setCameraError(
        'Camera/Microphone access was denied or is unavailable on this device.'
      );
      showToast('Failed to start recorder: Permission denied', 'error');
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const result = await evidenceService.stopRecording();
    if (result) {
      setRecordedBlob(result.blob);
      setRecordedUrl(result.url);
      setStream(null);

      // Save into local db
      const savedRecord = evidenceService.saveEvidenceRecord(
        result.blob,
        result.duration,
        location,
        incidentType
      );
      setLatestSavedRecord(savedRecord);
      setSelectedRecordForShare(savedRecord);
      setRecords(localDb.getEvidenceRecords());
      showToast('Encrypted video evidence saved to vault. Tiered dispatch ready.', 'success');
    }
  };

  const handleDownload = (blob?: Blob | null) => {
    const target = blob || recordedBlob;
    if (!target) return;
    const filename = `merca-evidence-${Date.now()}.webm`;
    evidenceService.downloadFile(target, filename);
    showToast(`Downloaded evidence package: ${filename}`, 'success');
  };

  const handleDeleteRecord = (id: string) => {
    localDb.deleteEvidenceRecord(id);
    setRecords(localDb.getEvidenceRecords());
    if (selectedRecordForShare?.id === id) {
      setSelectedRecordForShare(null);
    }
    showToast('Evidence deleted from storage', 'info');
  };

  // Tiered Sharing Handlers
  const handleShareTier = (tier: 'authorities' | 'primary_contacts' | 'safety_circle', record: VideoEvidenceRecord) => {
    const payload = evidenceService.generateTieredSharePayload(record, tier);

    if (tier === 'authorities') {
      // Direct police emergency WhatsApp / SMS
      emergencyService.openWhatsApp('112', payload.text);
      if (payload.downloadTrigger && recordedBlob) {
        handleDownload(recordedBlob);
      }
      showToast('Authorities evidence package generated with forensic tamper-proof hash', 'success');
    } else if (tier === 'primary_contacts') {
      // Primary ICE contacts
      const primaryPhone = contacts[0]?.phone || '';
      emergencyService.openWhatsApp(primaryPhone, payload.text);
      showToast(`Evidence & map dispatched to Priority Contacts (${contacts[0]?.name || 'Circle'})`, 'success');
    } else {
      // Safety circle - data-saving text only
      const phones = contacts.map((c) => c.phone).join(',');
      emergencyService.openSmsApp(phones, payload.text);
      showToast('Bandwidth-saving location & status dispatched to Safety Circle', 'success');
    }
  };

  const currentTimestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  const content = (
    <div className="space-y-4 text-left">
      {/* HEADER SECTION (IF STANDALONE) */}
      {isStandalonePage && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div>
            <span className="text-[10px] font-bold text-[#e84e5f] uppercase tracking-wider block">
              SECURE TAMPER-PROOF FORENSIC RECORDER
            </span>
            <h2 className="text-xl font-black text-[#0f1d32] m-0">
              Emergency Video & Evidence Vault
            </h2>
          </div>
          <HonestStatusBadge type="verified" label="GPS WATERMARKED" />
        </div>
      )}

      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-[#e84e5f] shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* VIEWFINDER SCREEN */}
      <div className="relative w-full h-[270px] sm:h-[340px] bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
        {/* LIVE STREAM VIEWFINDER (RENDERED AS LONG AS NOT IN PLAYBACK PREVIEW) */}
        {!recordedUrl && (
          <video
            ref={videoLiveRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* RECORDED PLAYBACK PREVIEW */}
        {recordedUrl && (
          <video
            ref={videoPlaybackRef}
            src={recordedUrl}
            controls
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* WATERMARK OVERLAY (STAMPED LIVE) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none text-white text-[10px] font-mono drop-shadow-md z-10">
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span>MECRA FORENSIC CAPTURE</span>
            </div>
            <div className="text-slate-300 mt-0.5">{currentTimestamp}</div>
          </div>

          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 text-right">
            <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
              <MapPin className="w-3 h-3" />
              <span>GPS LOCK</span>
            </div>
            <div className="text-slate-300">
              {location.lat !== 0 ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : 'Locking GPS...'}
            </div>
          </div>
        </div>

        {/* CAMERA FLIP BUTTON (FRONT/REAR) */}
        {!recordedUrl && !isRecording && (
          <button
            onClick={handleToggleCamera}
            className="absolute top-16 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold py-1.5 px-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer z-10 shadow-md active:scale-95"
            title="Switch Front/Rear Camera"
          >
            <SwitchCamera className="w-3.5 h-3.5" />
            <span className="text-[10px]">{facingMode === 'environment' ? 'Rear Camera' : 'Front Selfie'}</span>
          </button>
        )}

        {/* RECORDING TIMER AT BOTTOM */}
        {isRecording && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-rose-600/95 text-white font-mono font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xl animate-pulse z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>REC {formatTimer(duration)} / 03:00</span>
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="px-6 py-3.5 rounded-2xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <div className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span>Start Video & Audio Recording</span>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Square className="w-4 h-4 fill-white text-white" />
            <span>Stop & Encrypt Evidence</span>
          </button>
        )}

        {recordedBlob && (
          <button
            onClick={() => handleDownload()}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Video File</span>
          </button>
        )}

        {recordedUrl && (
          <button
            onClick={() => {
              setRecordedUrl(null);
              setRecordedBlob(null);
            }}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Record New Video</span>
          </button>
        )}
      </div>

      {/* TIERED SHARING PANEL (MENTOR SPECIFICATION) */}
      {(selectedRecordForShare || latestSavedRecord) && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-indigo-200 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">
                MENTOR SPECIFICATION • TIERED DISPATCH
              </span>
              <h4 className="text-sm font-black text-[#0f1d32]">
                Tiered Evidence Sharing
              </h4>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
              3-Level Dispatch
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Distribute this incident record securely based on sensitivity. Full video and forensic certificates are shared with authorities and primary contacts, while general circle contacts receive data-saving status & location alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* TIER 1: AUTHORITIES / POLICE */}
            <div className="p-3 bg-white rounded-2xl border border-rose-200 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 uppercase">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Tier 1: Police 112</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Full Video + Forensic GPS Timestamp Certificate + SHA256 Hash.
                </p>
              </div>
              <button
                onClick={() => handleShareTier('authorities', selectedRecordForShare || latestSavedRecord!)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Send to Police</span>
              </button>
            </div>

            {/* TIER 2: PRIORITY 1 & 2 CONTACTS */}
            <div className="p-3 bg-white rounded-2xl border border-blue-200 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 uppercase">
                  <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Tier 2: Primary ICE</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Video download link + Live Google Maps route navigation.
                </p>
              </div>
              <button
                onClick={() => handleShareTier('primary_contacts', selectedRecordForShare || latestSavedRecord!)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Notify P1 & P2</span>
              </button>
            </div>

            {/* TIER 3: SAFETY CIRCLE (BANDWIDTH SAVING) */}
            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tier 3: Safety Circle</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Status & Location text ONLY. Conserves 2G/mobile network bandwidth.
                </p>
              </div>
              <button
                onClick={() => handleShareTier('safety_circle', selectedRecordForShare || latestSavedRecord!)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Status Only (SMS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED EVIDENCE VAULT */}
      <div className="pt-2">
        <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Encrypted Evidence Vault ({records.length})</span>
          <span className="text-[10px] text-slate-500 font-normal">Offline on-device storage</span>
        </h4>

        {records.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No video evidence recorded yet. Hit 'Start Video Recording' above to record verifiable proof of your situation.
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#0f1d32] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#e84e5f]" />
                    <span>{rec.incidentType}</span>
                    <span className="text-[10px] text-slate-500 font-medium font-mono">
                      ({rec.durationSeconds}s • {rec.sizeMb} MB)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(rec.recordedAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}{' '}
                    • 📍 {rec.locationAddress.split(',')[0]}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setRecordedUrl(rec.fileBlobUrl);
                      setSelectedRecordForShare(rec);
                    }}
                    title="Preview video"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => setSelectedRecordForShare(rec)}
                    title="Tiered Share"
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    title="Delete record"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // If used as a standalone page, render directly inside page container
  if (isStandalonePage) {
    return <div className="p-4">{content}</div>;
  }

  // Otherwise, render inside modal wrapper
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* MODAL HEADER */}
        <div className="bg-[#0f1d32] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e84e5f] text-white flex items-center justify-center font-black">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight uppercase">
                  Emergency Evidence Recorder
                </h3>
                {isRecording && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e84e5f] animate-ping" />
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Encrypted 3-Minute Video/Audio Vault with GPS Watermark
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                if (isRecording) handleStopRecording();
                evidenceService.cleanUpStreams();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
};
