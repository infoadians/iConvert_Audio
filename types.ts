
export interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  outputUrl?: string;
  outputName?: string;
  error?: string;
  transcriptionStatus?: 'idle' | 'processing' | 'done' | 'error';
  transcriptionResult?: string;
}

export interface ConversionOptions {
  bitrate: string;
  sampleRate: string;
}

export const BITRATE_OPTIONS = [
  { label: '128 kbps (Standard)', value: '128k' },
  { label: '192 kbps (High)', value: '192k' },
  { label: '256 kbps (Excellent)', value: '256k' },
  { label: '320 kbps (Max)', value: '320k' },
];

export const SAMPLE_RATE_OPTIONS = [
  { label: '44.1 kHz (CD Quality)', value: '44100' },
  { label: '48 kHz (Professional)', value: '48000' },
];

export interface ProcessTemplate {
  id: string;
  name: string;
  prompt: string;
}
