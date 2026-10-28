import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { evidenceService } from '../../services/evidenceService';
import { localDb } from '../../services/storage';
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
} from 'lucide-react';

interface VideoEvidenceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  incidentType?: string;
}

export const VideoEvidenceRecorder: React.FC<VideoEvidenceRecorderProps> = ({
  isOpen,
  onClose,
  incidentType = 'Safety Threat / Incident',
}) => {
  const { location, showToast } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [records, setRecords] = useState<VideoEvidenceRecord[]>(() =>
    localDb.getEvidenceRecords()
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);

  // Attach live camera stream
  useEffect(() => {
    if (stream && videoLiveRef.current) {
      videoLiveRef.current.srcObject = stream;
    }
  }, [stream]);

  // Clean up when modal closes
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

  const handleStartRecording = async () => {
    setCameraError(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
    try {
      const activeStream = await evidenceService.startRecording(
        (secs) => setDuration(secs),
        () => handleStopRecording()
      );
      setStream(activeStream);
      setIsRecording(true);
      showToast('Recording started with GPS & timestamp watermark', 'info');
    } catch (err: any) {
      setCameraError(
        'Camera/Microphone access was denied or is unavailable. Please check device permissions.'
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
      setRecords(localDb.getEvidenceRecords());
      showToast('Emergency evidence saved to local encrypted vault', 'success');
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
    showToast('Evidence deleted from storage', 'info');
  };

  const currentTimestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* HEADER */}
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
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-[#e84e5f] shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* VIEWFINDER SCREEN */}
          <div className="relative w-full h-[260px] sm:h-[320px] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {/* LIVE STREAM */}
            {isRecording && (
              <video
                ref={videoLiveRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* RECORDED PLAYBACK PREVIEW */}
            {!isRecording && recordedUrl && (
              <video
                ref={videoPlaybackRef}
                src={recordedUrl}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            )}

            {/* IDLE PLACEHOLDER */}
            {!isRecording && !recordedUrl && (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-3">
                  <Video className="w-6 h-6 text-slate-500" />
                </div>
                <h4 className="text-white font-bold text-sm">Camera Standby</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Click 'Start Recording' below to capture encrypted audio and video of your environment.
                </p>
              </div>
            )}

            {/* WATERMARK OVERLAY (VISIBLE DURING RECORDING OR PREVIEW) */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none text-white text-[10px] font-mono drop-shadow-md">
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-[#e84e5f] animate-pulse" />
                  <span>MECRA VERIFIED EVIDENCE</span>
                </div>
                <div className="text-slate-300 mt-0.5">{currentTimestamp}</div>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-right">
                <div className="text-emerald-400 font-bold">GPS WATERMARK</div>
                <div className="text-slate-300">
                  {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                </div>
              </div>
            </div>

            {/* RECORDING TIMER AT BOTTOM */}
            {isRecording && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-mono font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>REC {formatTimer(duration)} / 03:00</span>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-1">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3 rounded-2xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>Start Video & Audio Recording</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop & Save to Vault</span>
              </button>
            )}

            {recordedBlob && (
              <button
                onClick={() => handleDownload()}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download to Phone</span>
              </button>
            )}
          </div>

          {/* SAVED EVIDENCE VAULT */}
          {records.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Stored Evidence Vault ({records.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Stored locally on device</span>
              </h4>

              <div className="space-y-2">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
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
                        • {rec.locationAddress.split(',')[0]}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRecordedUrl(rec.fileBlobUrl);
                        }}
                        title="Preview"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
