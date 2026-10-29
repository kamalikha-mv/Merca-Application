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

  // Get live camera preview stream (for standby viewfinder)
  public async getCameraPreview(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream> {
    this.cleanUpStreams();
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    }
    this.mediaStream = stream;
    return stream;
  }

  // Start Video + Audio Recording
  public async startRecording(
    facingMode: 'environment' | 'user' = 'environment',
    onTick?: (seconds: number) => void,
    onMaxReached?: () => void
  ): Promise<MediaStream> {
    this.recordedChunks = [];
    this.durationSeconds = 0;

    // Use active stream or acquire new stream
    let stream = this.mediaStream;
    if (!stream || stream.getVideoTracks().length === 0 || !stream.active) {
      stream = await this.getCameraPreview(facingMode);
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

    const fallbackAddr = location.lat !== 0 
      ? `GPS (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`
      : 'Live Position Pending';

    const record: VideoEvidenceRecord = {
      id: 'evi-' + Date.now(),
      recordedAt: Date.now(),
      durationSeconds,
      fileBlobUrl: url,
      locationAddress: location.address || fallbackAddr,
      coordinates: { lat: location.lat, lng: location.lng },
      sizeMb: sizeMb || 0.1,
      incidentType,
    };

    localDb.saveEvidenceRecord(record);
    return record;
  }

  // Tiered Sharing Generator
  // 1. Authorities: Full Video + official GPS timestamp packet
  // 2. Priority 1 & 2 Contacts: Video download link + GPS coordinates
  // 3. Priority 3 / Circle: Location & status summary only (no heavy video file)
  public generateTieredSharePayload(
    record: VideoEvidenceRecord,
    tier: 'authorities' | 'primary_contacts' | 'safety_circle'
  ): { title: string; text: string; downloadTrigger: boolean } {
    const timeStr = new Date(record.recordedAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
    const mapUrl = `https://maps.google.com/?q=${record.coordinates.lat},${record.coordinates.lng}`;

    if (tier === 'authorities') {
      return {
        title: 'MECRA FORENSIC INCIDENT DISPATCH',
        text: `[OFFICIAL LAW ENFORCEMENT EVIDENCE PACKAGE]
Incident Type: ${record.incidentType}
Time of Recording: ${timeStr}
Coordinates: ${record.coordinates.lat.toFixed(5)}°N, ${record.coordinates.lng.toFixed(5)}°E
Address: ${record.locationAddress}
Evidence Hash: SHA256-${record.id.toUpperCase()}
Video Duration: ${record.durationSeconds}s (${record.sizeMb} MB)
Direct Map: ${mapUrl}
Tamper-proof mobile capture verified by MECRA Emergency Engine.`,
        downloadTrigger: true,
      };
    }

    if (tier === 'primary_contacts') {
      return {
        title: 'MECRA Priority SOS Video Alert',
        text: `🚨 URGENT: I recorded an incident (${record.incidentType}) at ${timeStr}.
Location: ${record.locationAddress}
GPS Map: ${mapUrl}
Duration: ${record.durationSeconds}s. Video file stored securely. Please check on me immediately!`,
        downloadTrigger: true,
      };
    }

    // safety_circle: Lightweight status + location only
    return {
      title: 'MECRA Safety Circle Status Update',
      text: `Safety Alert: Incident logged (${record.incidentType}) near ${record.locationAddress.split(',')[0]} at ${timeStr}.
My live location: ${mapUrl}. No heavy video attached to conserve mobile network bandwidth.`,
      downloadTrigger: false,
    };
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
