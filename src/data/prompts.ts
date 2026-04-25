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

// Models offered in the Settings → Model selector. Aliases (*-latest)
// auto-track Google's newest stable release; specific 3.x versions are
// pinned. The "Custom model id" option in Settings lets the user type
// any other model id (e.g. a future gemini-3.x variant).
export type ModelOption = { id: string; label: string };
export const AVAILABLE_MODELS: ModelOption[] = [
    { id: 'gemini-flash-latest', label: 'Flash (Latest)' },
    { id: 'gemini-pro-latest', label: 'Pro (Latest)' },
    { id: 'gemini-3.1-flash', label: 'Flash 3.1' },
    { id: 'gemini-3.1-pro', label: 'Pro 3.1' },
];
export const DEFAULT_MODEL = 'gemini-flash-latest';

