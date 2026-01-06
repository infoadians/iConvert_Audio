
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';

import { SettingsModal } from './components/SettingsModal';
import { TranscriptModal } from './components/TranscriptModal';
import { AudioFile, ConversionOptions, ProcessTemplate } from './types';
import { FFmpegManager } from './services/ffmpegService';
import { translations, Language } from './i18n';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  // Hardcoded options for conversion
  const options: ConversionOptions = {
    bitrate: '128k',
    sampleRate: '44100',
  };
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState(false);

  // Theme Color
  const [primaryHue, setPrimaryHue] = useState(249); // Default Indigo

  // API Key & Settings Modal State
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Process Templates
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);

  // Transcript Modal State
  const [viewingTranscript, setViewingTranscript] = useState<{ name: string, content: string } | null>(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  const t = translations[lang];
  const ffmpegManager = FFmpegManager.getInstance();

  useEffect(() => {
    // Only toggle the class, let CSS handle colors
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Apply primary color variable
    document.documentElement.style.setProperty('--primary-h', primaryHue.toString());
  }, [primaryHue]);

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

    const init = async () => {
      try {
        await ffmpegManager.load();
        setIsFFmpegLoaded(true);
      } catch (error: any) {
        setInitError(error.message || "Engine Error");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('iconvert_gemini_key', key);
    } else {
      localStorage.removeItem('iconvert_gemini_key');
    }
  };

  const handleSaveTemplates = (newTemplates: ProcessTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('iconvert_templates', JSON.stringify(newTemplates));
  };

  const onFilesAdded = useCallback((newFiles: File[]) => {
    const audioFiles: AudioFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      transcriptionStatus: 'idle'
    }));
    setFiles(prev => [...prev, ...audioFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed' && f.transcriptionStatus !== 'done'));
  }, []);

  const startConversion = useCallback(async (id: string) => {
    const targetFile = files.find(f => f.id === id);
    if (!targetFile || targetFile.status === 'converting') return;

    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'converting', progress: 0 } : f
    ));

    try {
      const { url, name } = await ffmpegManager.convert(targetFile.file, options, (progress) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(progress * 100) } : f));
      });

      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'completed', outputUrl: url, outputName: name, progress: 100 } : f
      ));
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: err.message || 'Error' } : f));
    }
  }, [files, options]);

  const convertAll = useCallback(() => {
    files.forEach(file => { if (file.status === 'pending') startConversion(file.id); });
  }, [files, startConversion]);


  // --- Transcription Logic ---

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
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
    const targetFile = files.find(f => f.id === id);
    if (!targetFile || !apiKey) return;

    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, transcriptionStatus: 'processing' } : f
    ));

    try {
      const base64Data = await fileToBase64(targetFile.file);
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Updated model
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: targetFile.file.type || 'audio/mp3', data: base64Data } },
              { text: "please transcribe the attached audio, without adding or deleting any words, just add the proper punctuation grouping in short paragraphs, preferable of 3 or 4 sentences each" }
            ]
          }
        ]
      });

      const text = response.text;

      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, transcriptionStatus: 'done', transcriptionResult: text } : f
      ));

    } catch (err: any) {
      console.error("Transcription Error", err);
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, transcriptionStatus: 'error' } : f
      ));
    }
  };

  const handleProcessText = async (template: ProcessTemplate) => {
    if (!viewingTranscript || !apiKey) return;
    setIsProcessingTranscript(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Background Text:\n${viewingTranscript.content}\n\nTask: ${template.prompt}` }
            ]
          }
        ]
      });
      setViewingTranscript(prev => prev ? { ...prev, content: response.text } : null);
    } catch (err) {
      console.error("Processing Error", err);
    } finally {
      setIsProcessingTranscript(false);
    }
  };

  const transcribeAll = useCallback(() => {
    files.forEach(file => { if (file.status === 'pending' || (file.status === 'completed' && (!file.transcriptionStatus || file.transcriptionStatus === 'idle'))) transcribeFile(file.id); });
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
        name: targetFile.name,
        content: targetFile.transcriptionResult
      });
    }
  };

  const hasPending = files.some(f => f.status === 'pending');
  const hasFiles = files.length > 0;

  return (
    <div className="app-container">
      <Header
        t={t}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
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

      <main className="main-content">
        {isInitializing ? (
          <div className="state-container animate-fade-in">
            <div className="spinner"></div>
            <p className="state-text">{t.initializing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="state-container">
            <div className="error-card glass-panel">
              <div className="error-icon">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="error-title">{t.engineError}</h2>
              <p className="error-desc">{t.engineDesc}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-retry"
              >
                {t.retry}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Main Studio Card */}
            <div className="glass-panel main-panel">

              {/* Top Section: Upload */}
              <div className={`upload-section ${hasFiles ? 'has-files' : ''}`}>
                <DropZone onFilesAdded={onFilesAdded} compact={hasFiles} t={t} />
              </div>

              {/* Middle Section: Queue */}
              {hasFiles && (
                <div className="queue-section animate-fade-in">
                  <div className="queue-header">
                    <div className="queue-title-group">
                      <span className="queue-label">{t.queue}</span>
                      <span className="queue-count">{files.length}</span>
                    </div>
                  </div>
                  <div className="file-list-container">
                    <FileList
                      files={files}
                      onRemove={removeFile}
                      onConvert={startConversion}
                      onTranscribe={transcribeFile}
                      onDownloadTranscript={downloadTranscript}
                      onViewTranscript={handleViewTranscript}
                      hasApiKey={!!apiKey}
                      t={t}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Section: Controls & Actions */}
              <div className="controls-section">
                <div className="batch-actions">
                  <button
                    onClick={convertAll}
                    disabled={!hasPending}
                    className="btn-primary"
                  >
                    {t.convertToMp3}
                  </button>
                  <button
                    onClick={transcribeAll}
                    disabled={!hasPending && !files.some(f => f.status === 'completed' && f.transcriptionStatus === 'idle')}
                    className="btn-primary"
                  >
                    {t.transcribeToText}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer / Tip */}
            <div className="footer-tip animate-fade-in">
              <p>
                iConvert Audio, by Bella Labs, V0.0.1
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
