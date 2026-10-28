import { VideoEvidenceRecord, LocationData } from '../types';
import { localDb } from './storage';

export interface RecorderState {
  isRecording: boolean;
  recordingDuration: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;
}

class EmergencyEvidenceService {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private timerInterval: number | null = null;
  private durationSeconds = 0;
  private maxDurationSeconds = 180; // 3 minutes limit

  // Start Video + Audio Recording
  public async startRecording(
    onTick?: (seconds: number) => void,
    onMaxReached?: () => void
  ): Promise<MediaStream> {
    this.recordedChunks = [];
    this.durationSeconds = 0;

    // Try video + audio, fallback to audio only if camera unavailable
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
    } catch {
      // Fallback: try front camera or audio only
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    }

    this.mediaStream = stream;

    // Determine supported mime type
    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else {
        mimeType = '';
      }
    }

    const options = mimeType ? { mimeType } : undefined;
    this.mediaRecorder = new MediaRecorder(stream, options);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(1000); // chunk every 1 second

    // Timer
    this.timerInterval = window.setInterval(() => {
      this.durationSeconds += 1;
      if (onTick) onTick(this.durationSeconds);

      if (this.durationSeconds >= this.maxDurationSeconds) {
        if (onMaxReached) onMaxReached();
        this.stopRecording();
      }
    }, 1000);

    return stream;
  }

  // Stop Recording and return Blob
  public async stopRecording(): Promise<{ blob: Blob; url: string; duration: number } | null> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanUpStreams();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.recordedChunks[0]?.type || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const duration = this.durationSeconds;

        this.cleanUpStreams();
        resolve({ blob, url, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  // Release camera / mic hardware
  public cleanUpStreams(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }

  // Save evidence to records database
  public saveEvidenceRecord(
    blob: Blob,
    durationSeconds: number,
    location: LocationData,
    incidentType = 'Emergency Incident'
  ): VideoEvidenceRecord {
    const url = URL.createObjectURL(blob);
    const sizeMb = Math.round((blob.size / (1024 * 1024)) * 100) / 100;

    const record: VideoEvidenceRecord = {
      id: 'evi-' + Date.now(),
      recordedAt: Date.now(),
      durationSeconds,
      fileBlobUrl: url,
      locationAddress: location.address || 'Kilambakkam, Chennai Region',
      coordinates: { lat: location.lat, lng: location.lng },
      sizeMb: sizeMb || 0.1,
      incidentType,
    };

    localDb.saveEvidenceRecord(record);
    return record;
  }

  // Download directly to device storage
  public downloadFile(blob: Blob, filename = 'merca-emergency-evidence.webm'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

export const evidenceService = new EmergencyEvidenceService();
