import React, { useState, useEffect, useCallback } from 'react';
import { get, set, del } from 'idb-keyval';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';

import { SettingsModal } from './components/SettingsModal';
import { TranscriptModal } from './components/TranscriptModal';
import { AudioFile, ConversionOptions, ProcessTemplate, ProcessedResult, DocumentFile } from './types';
import { FFmpegManager } from './services/ffmpegService';
import { translations, Language } from './i18n';
import { GoogleGenAI } from "@google/genai";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Set PDF worker source
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { SplashScreen } from './components/SplashScreen';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isIPhone, setIsIPhone] = useState(false);
  const [showIPhoneTip, setShowIPhoneTip] = useState(false);
  // Hardcoded options for conversion
  const options: ConversionOptions = {
    bitrate: '24k',
    sampleRate: '48000',
  };
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('iconvert_lang') as Language) || 'en';
  });
  const [isDark, setIsDark] = useState(false);

  // Theme Color
  const [primaryHue, setPrimaryHue] = useState(249); // Default Indigo

  // API Key & Settings Modal State
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Process Templates
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);

  // Transcript Modal State
  const [viewingTranscript, setViewingTranscript] = useState<{ id: string, name: string, content: string } | null>(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  // Processed Results State
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([]);
  const [viewingProcessed, setViewingProcessed] = useState<ProcessedResult | null>(null);

  // Global Font Scale (0.5 to 2.0)
  const [fontScale, setFontScale] = useState(1.0);

  // Collapsible Sections State
  const [expandedSections, setExpandedSections] = useState({
    queue: false,
    transcribed: false,
    documents: false,
    processed: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      const isCurrentlyOpen = prev[section];
      if (isCurrentlyOpen) {
        // If clicking an open section, just close it (optional: can leave others closed)
        return { ...prev, [section]: false };
      } else {
        // If clicking a closed section, open it and close ALL others
        return {
          queue: section === 'queue',
          transcribed: section === 'transcribed',
          documents: section === 'documents',
          processed: section === 'processed'
        };
      }
    });
  };

  const t = translations[lang];
  const ffmpegManager = FFmpegManager.getInstance();

  // Persistence: Save state when changed
  useEffect(() => {
    if (!isInitializing) {
      // Save metadata only to iconvert_files to avoid size limits/corruption
      const metadata = files.map(({ file, ...meta }) => meta);
      set('iconvert_files', metadata);
    }
  }, [files, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      // Save documents
      const docMetadata = documents.map(({ file, ...meta }) => meta);
      set('iconvert_documents', docMetadata);
    }
  }, [documents, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      set('iconvert_results', processedResults);
    }
  }, [processedResults, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      set('iconvert_is_dark', isDark);
    }
    // Update Meta Tag immediately
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#f8fafc');
    }
  }, [isDark, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      set('iconvert_primary_hue', primaryHue);
    }
    document.documentElement.style.setProperty('--primary-h', primaryHue.toString());
    document.documentElement.style.setProperty('--primary', `${primaryHue} 95% 60%`);
    document.documentElement.style.setProperty('--ring', `${primaryHue} 95% 60%`);
  }, [primaryHue, isInitializing]);

  useEffect(() => {
    // Apply global font scale
    document.documentElement.style.setProperty('--global-font-scale', fontScale.toString());
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  useEffect(() => {
    const storedKey = localStorage.getItem('iconvert_gemini_key');
    if (storedKey) setApiKey(storedKey);

    const storedTemplates = localStorage.getItem('iconvert_templates');
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch (e) {
        console.error("Error parsing templates", e);
      }
    }

    const storedFontScale = localStorage.getItem('iconvert_font_scale');
    if (storedFontScale) setFontScale(parseFloat(storedFontScale));
  }, []);

  useEffect(() => {
    localStorage.setItem('iconvert_lang', lang);
  }, [lang]);

  // Initialization Logic
  useEffect(() => {
    // 1. Safety Timeout: Force app to load after 5s no matter what
    const safetyTimeout = setTimeout(() => {
      setIsInitializing((prev) => {
        if (prev) {
          console.warn("Initialization timed out, forcing load.");
          setShowSplash(false);
          return false;
        }
        return prev;
      });
    }, 5000);

    const initApp = async () => {
      try {
        // A. Load Persisted Data
        try {
          const [savedFiles, savedResults, savedIsDark, savedHue] = await Promise.all([
            get('iconvert_files'),
            get('iconvert_results'),
            get('iconvert_is_dark'),
            get('iconvert_primary_hue')
          ]);

          if (Array.isArray(savedFiles)) {
            // Rehydrate files with their binary data from individual keys
            const rehydratedFiles = await Promise.all(
              savedFiles.map(async (meta: any) => {
                try {
                  const blob = await get(`iconvert_file_data_${meta.id}`);
                  if (blob) {
                    // Reconstruct File object if possible, or just use Blob
                    return { ...meta, file: blob as File };
                  }
                  return { ...meta, status: 'error', error: 'File data lost' };
                } catch (e) {
                  return { ...meta, status: 'error', error: 'Loading error' };
                }
              })
            );
            setFiles(rehydratedFiles);
          }
          if (Array.isArray(savedResults)) setProcessedResults(savedResults);
          if (savedIsDark !== undefined) setIsDark(!!savedIsDark);
          if (savedHue !== undefined) setPrimaryHue(Number(savedHue));
        } catch (storageErr) {
          console.error("Storage loading error:", storageErr);
          // Non-fatal, continue
        }

        try {
          const savedDocs = await get('iconvert_documents');
          if (Array.isArray(savedDocs)) {
            const rehydratedDocs = await Promise.all(
              savedDocs.map(async (meta: any) => {
                try {
                  const blob = await get(`iconvert_doc_data_${meta.id}`);
                  if (blob) return { ...meta, file: blob as File };
                  return { ...meta, content: "Error loading content" }; // Fallback
                } catch (e) { return null; }
              })
            );
            setDocuments(rehydratedDocs.filter(d => d !== null) as DocumentFile[]);
          }
        } catch (e) {
          console.error("Doc storage error", e);
        }

        // B. Load FFmpeg Engine
        try {
          await ffmpegManager.load();
          setIsFFmpegLoaded(true);
        } catch (engineErr: any) {
          console.error("FFmpeg loading error:", engineErr);
          setInitError(engineErr.message || "Engine failed to load");
        }

      } catch (err) {
        console.error("Fatal initialization error:", err);
      } finally {
        // C. Finish Init
        clearTimeout(safetyTimeout);
        // Small delay for smooth splash transition
        setTimeout(() => {
          setIsInitializing(false);
          setTimeout(() => setShowSplash(false), 800);
        }, 1000);
      }
    };

    initApp();

    // Check for iPhone / PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsIPhone(isIOS);
    if (isIOS && !isPWA) {
      setTimeout(() => setShowIPhoneTip(true), 3000);
    }

    return () => clearTimeout(safetyTimeout);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('iconvert_gemini_key', key);
      toast.success("API Key saved");
    } else {
      localStorage.removeItem('iconvert_gemini_key');
      toast.info("API Key removed");
    }
  };

  const handleSaveTemplates = (newTemplates: ProcessTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('iconvert_templates', JSON.stringify(newTemplates));
  };

  const handleSaveFontScale = (scale: number) => {
    setFontScale(scale);
    localStorage.setItem('iconvert_font_scale', scale.toString());
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const reader = new FileReader();
      reader.onload = (e) => {
        audio.src = e.target?.result as string;
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
        audio.onerror = () => resolve(0);
      };
      reader.readAsDataURL(file);
    });
  };

  const onFilesAdded = useCallback(async (newFiles: File[]) => {
    const audioCandidates: File[] = [];
    const docCandidates: File[] = [];

    newFiles.forEach(f => {
      if (f.type.startsWith('audio/') || f.type.startsWith('video/') || f.name.match(/\.(m4a|wav|opus|ogg|mp3|mp4|mov)$/i)) {
        audioCandidates.push(f);
      } else if (f.name.match(/\.(txt|md|docx|pdf)$/i)) {
        docCandidates.push(f);
      }
    });

    if (audioCandidates.length > 0) {
      const audioFiles: AudioFile[] = await Promise.all(audioCandidates.map(async file => {
        const duration = await getAudioDuration(file);
        const id = Math.random().toString(36).substring(7);
        // Persist file blob
        await set(`iconvert_file_data_${id}`, file);
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          duration,
          status: 'pending',
          progress: 0,
          transcriptionStatus: 'idle',
          timestamp: Date.now()
        };
      }));
      setFiles(prev => [...prev, ...audioFiles]);
    }

    if (docCandidates.length > 0) {
      const docFiles: DocumentFile[] = await Promise.all(docCandidates.map(async file => {
        const id = Math.random().toString(36).substring(7);
        await set(`iconvert_doc_data_${id}`, file);

        let content = '';
        try {
          if (file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            content = result.value;
          } else if (file.name.endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            content = fullText;
          } else {
            content = await file.text();
          }
        } catch (e) {
          console.error("Error reading doc", e);
          content = "Error reading document content.";
        }

        return {
          id,
          file,
          name: file.name,
          size: file.size,
          content,
          timestamp: Date.now()
        };
      }));
      setDocuments(prev => [...prev, ...docFiles]);
    }

    toast.success(`${audioCandidates.length + docCandidates.length} file(s) added`);
  }, []);

  const removeFile = useCallback((id: string, type: 'audio' | 'processed' | 'document' = 'audio') => {
    if (type === 'audio') {
      setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove) {
          // Cleanup binary data
          del(`iconvert_file_data_${id}`).catch(err => console.warn("Cleanup error", err));

          if (fileToRemove.transcriptionStatus === 'done' && fileToRemove.transcriptionResult) {
            // Archive the transcript before deleting
            const archivedResult: ProcessedResult = {
              id: Math.random().toString(36).substring(7),
              audioFileName: fileToRemove.name,
              templateName: 'Original Transcript',
              result: fileToRemove.transcriptionResult,
              timestamp: Date.now()
            };
            setProcessedResults(p => [archivedResult, ...p]);
            toast.info("Transcribed text saved to results");
          }
        }
        return prev.filter(f => f.id !== id);
      });
    } else if (type === 'processed') {
      setProcessedResults(prev => prev.filter(r => r.id !== id));
    } else if (type === 'document') {
      setDocuments(prev => {
        const docToRemove = prev.find(d => d.id === id);
        if (docToRemove) del(`iconvert_doc_data_${id}`);
        return prev.filter(d => d.id !== id);
      });
    }
  }, []);

  const startConversion = useCallback(async (id: string) => {
    const targetFile = files.find(f => f.id === id);
    if (!targetFile || targetFile.status === 'converting') return;

    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'converting', progress: 0 } : f
    ));

    try {
      const { url, name, size } = await ffmpegManager.convert(targetFile.file, options, (progress) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(progress * 100) } : f));
      });

      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'completed', outputUrl: url, outputName: name, size, progress: 100 } : f
      ));
      toast.success("Conversion complete");
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: err.message || 'Error' } : f));
      toast.error("Conversion failed");
    }
  }, [files, options]);

  const convertAll = useCallback(() => {
    files.forEach(file => { if (file.status === 'pending') startConversion(file.id); });
  }, [files, startConversion]);


  // --- Transcription Logic ---

  const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const transcribeFile = async (id: string) => {
    // We need to find the file in the current state
    const currentFiles = await new Promise<AudioFile[]>(resolve => {
      setFiles(prev => {
        resolve(prev);
        return prev;
      });
    });
    const targetFile = currentFiles.find(f => f.id === id);

    if (!targetFile || !apiKey) {
      if (!apiKey) toast.error("API Key required for transcription");
      return;
    }

    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, transcriptionStatus: 'processing' } : f
    ));

    try {
      let blobToProcess: Blob = targetFile.file;
      let mimeType = targetFile.file.type || 'audio/mp3';

      // AUTO-CONVERSION LOGIC
      // If we have a converted file, use it. If not, convert it now.
      if (targetFile.status === 'completed' && targetFile.outputUrl) {
        try {
          const response = await fetch(targetFile.outputUrl);
          blobToProcess = await response.blob();
          mimeType = 'audio/ogg';
        } catch (e) {
          console.warn("Using original file as converted file could not be fetched", e);
        }
      } else {
        // Perform auto-conversion
        toast.info("Optimizing audio for faster processing...");
        try {
          // Show converting status
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'converting', progress: 0 } : f));

          const { url, name, size } = await ffmpegManager.convert(targetFile.file, options, (progress) => {
            setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(progress * 100) } : f));
          });

          // Update to completed
          setFiles(prev => prev.map(f =>
            f.id === id ? { ...f, status: 'completed', outputUrl: url, outputName: name, size, progress: 100, transcriptionStatus: 'processing' } : f
          ));

          const response = await fetch(url);
          blobToProcess = await response.blob();
          mimeType = 'audio/ogg';

        } catch (convErr) {
          console.error("Auto-conversion failed", convErr);
          toast.warning("Optimization failed, sending original file.");
          // Reset status to allow retry or show error, but continue transcription with original
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
        }
      }

      const base64Data = await fileToBase64(blobToProcess);
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Data } },
              {
                text: `Actúa como un Transcriptor Profesional Forense. Tu objetivo es crear una transcripción literal perfecta del audio adjunto.

Reglas estrictas:
1.  **Diarización:** Identifica el inicio de cada intervención con etiquetas (e.g., [Hablante 1]). IMPORTANTE: Insertar la etiqueta SOLAMENTE cuando cambie el interlocutor. NO repitas la etiqueta en párrafos consecutivos del mismo hablante.
2.  **Verbatim:** Transcribe palabra por palabra exactamente lo que se dice. NO parafrasees, no resumas, no omitas nada.
3.  **Formato:** Agrupa en párrafos lógicos y cortos (máx. 4 oraciones) para legibilidad, pero sin alterar el orden de las palabras.
4.  **Puntuación:** Usa puntuación estándar para reflejar el ritmo y las pausas naturales del habla.
5.  **Multilenguaje:** Si se detectan varios idiomas, transcribe cada uno en su idioma original.
6.  **SALIDA:** Entrega SOLAMENTE el texto de la transcripción. NO incluyas introducciones, encabezados, ni notas finales. Empieza directamente con el primer hablante o la primera frase.` }
            ]
          }
        ]
      });

      const text = response.text;

      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, transcriptionStatus: 'done', transcriptionResult: text } : f
      ));
      toast.success("Transcription complete");

    } catch (err: any) {
      console.error("Transcription Error", err);
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, transcriptionStatus: 'error' } : f
      ));
      toast.error(`Transcription failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleProcessText = async (template: ProcessTemplate) => {
    if (!viewingTranscript || !apiKey) return;
    setIsProcessingTranscript(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Background Text:\n${viewingTranscript.content}\n\nTask (Responder en el idioma e instrucciones del prompt): ${template.prompt}` }
            ]
          }
        ]
      });

      const newResult: ProcessedResult = {
        id: Math.random().toString(36).substring(7),
        audioFileName: viewingTranscript.name,
        templateName: template.name,
        result: response.text,
        timestamp: Date.now()
      };

      setProcessedResults(prev => [newResult, ...prev]);
      setViewingTranscript(null); // Close transcript modal
      setViewingProcessed(newResult); // Open processed result viewer
      toast.success("Processing complete");
    } catch (err: any) {
      console.error("Processing Error", err);
      toast.error(`AI Processing failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessingTranscript(false);
    }
  };


  const transcribeAll = useCallback(() => {
    let count = 0;
    files.forEach(file => {
      if (file.status === 'pending' || (file.status === 'completed' && (!file.transcriptionStatus || file.transcriptionStatus === 'idle'))) {
        transcribeFile(file.id);
        count++;
      }
    });
    if (count === 0 && !apiKey) toast.error("No API key or compatible files");
  }, [files, apiKey, transcribeFile]);

  const downloadTranscript = (id: string, format: 'txt' | 'md') => {
    const targetFile = files.find(f => f.id === id);
    if (!targetFile || !targetFile.transcriptionResult) return;

    const blob = new Blob([targetFile.transcriptionResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetFile.name.split('.')[0]}_transcript.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Open modal to view transcript
  const handleViewTranscript = (id: string) => {
    const targetFile = files.find(f => f.id === id);
    if (targetFile && targetFile.transcriptionResult) {
      setViewingTranscript({
        id: targetFile.id,
        name: targetFile.name,
        content: targetFile.transcriptionResult
      });
    }
  };

  const handleViewDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setViewingTranscript({
        id: doc.id,
        name: doc.name,
        content: doc.content
      });
    }
  };

  const handleViewProcessed = (id: string) => {
    const result = processedResults.find(r => r.id === id);
    if (result) setViewingProcessed(result);
  };


  const hasPending = files.some(f => f.status === 'pending');
  const hasFiles = files.length > 0 || documents.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      <Toaster />
      {showSplash && (
        <div className={cn("fixed inset-0 z-[100] transition-opacity duration-1000", !isInitializing ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
          <SplashScreen />
        </div>
      )}

      {showIPhoneTip && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Card className="p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.install}</p>
                <p className="text-xs text-muted-foreground">{t.installDesc}</p>
              </div>
              <button onClick={() => setShowIPhoneTip(false)} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
          </Card>
        </div>
      )}

      <Header
        t={t}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
        primaryHue={primaryHue}
        setPrimaryHue={setPrimaryHue}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        templates={templates}
        onSaveTemplates={handleSaveTemplates}
        fontScale={fontScale}
        onSaveFontScale={handleSaveFontScale}
        t={t}
      />

      <TranscriptModal
        isOpen={!!viewingTranscript}
        onClose={() => setViewingTranscript(null)}
        fileName={viewingTranscript?.name || ''}
        content={viewingTranscript?.content || ''}
        templates={templates}
        onProcess={handleProcessText}
        isProcessing={isProcessingTranscript}
        t={t}
      />

      {/* Processed Result Viewer */}
      <TranscriptModal
        isOpen={!!viewingProcessed}
        onClose={() => setViewingProcessed(null)}
        fileName={`${viewingProcessed?.audioFileName} • ${viewingProcessed?.templateName}`}
        content={viewingProcessed?.result || ''}
        templates={[]}
        onProcess={undefined}
        isProcessing={false}
        t={t}
      />


      <main className="flex-1 container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground font-medium animate-pulse">{t.initializing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.engineError}</AlertTitle>
              <AlertDescription>
                {t.engineDesc}
                <div className="mt-4">
                  <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t.retry}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-5 duration-500">
            {/* DropZone Section */}
            <section className="w-full">
              <DropZone onFilesAdded={onFilesAdded} compact={hasFiles} t={t} />
            </section>

            {/* Content Lists */}
            {hasFiles && (
              <div className="grid gap-8">
                {/* Queue */}
                {files.some(f => f.transcriptionStatus !== 'done') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {t.queue || 'Queue'}
                        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {files.filter(f => f.transcriptionStatus !== 'done').length}
                        </span>
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => toggleSection('queue')} className="h-8 w-8 p-0">
                        {expandedSections.queue ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.queue && (
                      <FileList
                        files={files.filter(f => f.transcriptionStatus !== 'done')}
                        onRemove={removeFile}
                        onConvert={startConversion}
                        onTranscribe={transcribeFile}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="queue"
                      />
                    )}
                  </div>
                )}

                {/* Transcribed */}
                {files.some(f => f.transcriptionStatus === 'done') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {t.transcribedAudios}
                        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {files.filter(f => f.transcriptionStatus === 'done').length}
                        </span>
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => toggleSection('transcribed')} className="h-8 w-8 p-0">
                        {expandedSections.transcribed ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.transcribed && (
                      <FileList
                        files={files.filter(f => f.transcriptionStatus === 'done')}
                        onRemove={removeFile}
                        onViewTranscript={handleViewTranscript}
                        onDownloadTranscript={downloadTranscript}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="transcribed"
                      />
                    )}
                  </div>
                )}

                {/* Documents Section */}
                {documents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {t.documents}
                        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {documents.length}
                        </span>
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => toggleSection('documents')} className="h-8 w-8 p-0">
                        {expandedSections.documents ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.documents && (
                      <FileList
                        documents={documents}
                        onRemove={(id) => removeFile(id, 'document')}
                        onViewTranscript={handleViewDocument}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="documents"
                      />
                    )}
                  </div>
                )}

                {/* Processed Results */}
                {processedResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {t.processedResults}
                        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {processedResults.length}
                        </span>
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => toggleSection('processed')} className="h-8 w-8 p-0">
                        {expandedSections.processed ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.processed && (
                      <FileList
                        processedResults={processedResults}
                        onRemove={removeFile}
                        onViewProcessed={handleViewProcessed}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="processed"
                      />
                    )}
                  </div>
                )}
              </div>
            )}



          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p className="font-mono text-xs">iConvert Audio & Transcribe, by Bella Labs, V0.3.7</p>
      </footer>
    </div>
  );
};

export default App;
