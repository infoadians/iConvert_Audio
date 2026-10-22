import { GoogleGenAI } from "@google/genai";

// Dedicated speech-to-text model. Unlike the general Gemini models it takes
// no text prompt; behaviour is set through audioTranscriptionConfig, which
// the installed @google/genai version doesn't know about, so the request is
// sent through the REST endpoint directly. Audio goes through the Files API
// (the model's documented input path) and is deleted afterwards.
export const TRANSCRIBE_MODEL = 'gemini-3.5-transcribe';

// Diarization caps a request at 30 minutes of audio (1 hour without it).
const DIARIZATION_MAX_SECONDS = 30 * 60;

type TranscriptionPart = {
  text?: string;
  audioTranscription?: {
    speakerLabel?: string;
    words?: { word?: string }[];
  };
};

const waitUntilActive = async (ai: GoogleGenAI, name: string) => {
  for (let i = 0; i < 120; i++) {
    const file = await ai.files.get({ name });
    if (file.state === 'ACTIVE') return file;
    if (file.state === 'FAILED') throw new Error('Audio upload failed to process');
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Audio upload timed out');
};

// Collapse the per-part transcription into paragraphs, labelling a speaker
// only when the speaker changes (same convention as the default prompt).
const formatTranscript = (parts: TranscriptionPart[], speakerWord: string): string => {
  const segments: { speaker?: string; text: string }[] = [];
  for (const part of parts) {
    const speaker = part.audioTranscription?.speakerLabel;
    const text = (part.text ?? part.audioTranscription?.words?.map(w => w.word ?? '').join(' ') ?? '').trim();
    if (!text) continue;
    const last = segments[segments.length - 1];
    if (last && (speaker === undefined || speaker === last.speaker)) {
      last.text += ' ' + text;
    } else {
      segments.push({ speaker, text });
    }
  }

  if (!segments.some(s => s.speaker)) {
    return segments.map(s => s.text).join(' ').trim();
  }

  const numbers = new Map<string, number>();
  return segments.map(s => {
    if (!s.speaker) return s.text;
    if (!numbers.has(s.speaker)) numbers.set(s.speaker, numbers.size + 1);
    return `[${speakerWord} ${numbers.get(s.speaker)}] ${s.text}`;
  }).join('\n\n');
};

export const transcribeWithTranscribeModel = async (
  apiKey: string,
  audio: Blob,
  mimeType: string,
  durationSeconds: number | undefined,
  speakerWord: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const uploaded = await ai.files.upload({ file: audio, config: { mimeType } });
  if (!uploaded.name) throw new Error('Audio upload failed');

  try {
    const file = await waitUntilActive(ai, uploaded.name);
    const diarization = !durationSeconds || durationSeconds <= DIARIZATION_MAX_SECONDS;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TRANSCRIBE_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ fileData: { fileUri: file.uri, mimeType: file.mimeType || mimeType } }] }],
          generationConfig: {
            audioTranscriptionConfig: { mode: 'VERBATIM', diarization, languageCodes: [] }
          }
        })
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);

    const transcript = formatTranscript(json?.candidates?.[0]?.content?.parts ?? [], speakerWord);
    if (!transcript) throw new Error('Empty transcription');
    return transcript;
  } finally {
    ai.files.delete({ name: uploaded.name }).catch(() => {});
  }
};
