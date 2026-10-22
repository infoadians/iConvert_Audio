// Default prompt sent to the model when transcribing audio. Users can
// override this from Settings → "Transcription Prompt" and reset back
// to this default at any time.
export const DEFAULT_TRANSCRIPTION_PROMPT = `Actúa como un Transcriptor Profesional Forense. Tu objetivo es crear una transcripción literal perfecta del audio adjunto.

Reglas estrictas:
1.  **Diarización:** Identifica el inicio de cada intervención con etiquetas (e.g., [Hablante 1]). IMPORTANTE: Insertar la etiqueta SOLAMENTE cuando cambie el interlocutor. NO repitas la etiqueta en párrafos consecutivos del mismo hablante.
2.  **Verbatim:** Transcribe palabra por palabra exactamente lo que se dice. NO parafrasees, no resumas, no omitas nada.
3.  **Formato:** Agrupa en párrafos lógicos y cortos (máx. 4 oraciones) para legibilidad, pero sin alterar el orden de las palabras.
4.  **Puntuación:** Usa puntuación estándar para reflejar el ritmo y las pausas naturales del habla.
5.  **Multilenguaje:** Si se detectan varios idiomas, transcribe cada uno en su idioma original.
6.  **SALIDA:** Entrega SOLAMENTE el texto de la transcripción. NO incluyas introducciones, encabezados, ni notas finales. Empieza directamente con el primer hablante o la primera frase.`;

// Models offered in the Settings → Model selector, checked against
// Google's Gemini API model list (Oct 2026). The default is a pinned
// version so behaviour is predictable; the *-latest alias auto-tracks
// Google's newest Flash. "Custom model id" in Settings covers anything else.
export type ModelOption = { id: string; label: string };
export const AVAILABLE_MODELS: ModelOption[] = [
    { id: 'gemini-3.8-flash', label: 'Flash 3.8' },
    { id: 'gemini-flash-latest', label: 'Flash (Latest)' },
    { id: 'gemini-3.5-flash-lite', label: 'Flash-Lite 3.5' },
    { id: 'gemini-4-argon', label: 'Gemini 4 Argon' },
];
export const DEFAULT_MODEL = 'gemini-3.8-flash';

// IDs offered by earlier versions that don't exist (or were shut down);
// a stored selection of any of these is reset to DEFAULT_MODEL on load.
export const RETIRED_MODELS = [
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash',
    'gemini-3.1-pro',
    'gemini-pro-latest',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-3-pro-preview',
];

