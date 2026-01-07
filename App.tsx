
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';

import { SettingsModal } from './components/SettingsModal';
import { TranscriptModal } from './components/TranscriptModal';
import { AudioFile, ConversionOptions, ProcessTemplate, ProcessedResult } from './types';
import { FFmpegManager } from './services/ffmpegService';
import { translations, Language } from './i18n';
import { GoogleGenAI } from "@google/genai";
import { SplashScreen } from './components/SplashScreen';

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isIPhone, setIsIPhone] = useState(false);
  const [showIPhoneTip, setShowIPhoneTip] = useState(false);
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
  const [viewingTranscript, setViewingTranscript] = useState<{ id: string, name: string, content: string } | null>(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  // Processed Results State
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([]);
  const [viewingProcessed, setViewingProcessed] = useState<ProcessedResult | null>(null);

  // Global Font Scale (0.5 to 2.0)
  const [fontScale, setFontScale] = useState(1.0);

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
    // Apply global font scale
    document.documentElement.style.setProperty('--global-font-scale', fontScale.toString());
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

    const init = async () => {
      try {
        await ffmpegManager.load();
        setIsFFmpegLoaded(true);
      } catch (error: any) {
        setInitError(error.message || "Engine Error");
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
          setTimeout(() => setShowSplash(false), 800); // Wait for fade-out animation
        }, 1500); // Ensure splash is visible for at least 1.5s
      }
    };
    init();

    // Check for iPhone / PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsIPhone(isIOS);
    if (isIOS && !isPWA) {
      setTimeout(() => setShowIPhoneTip(true), 3000);
    }
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
    const audioFiles: AudioFile[] = await Promise.all(newFiles.map(async file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      transcriptionStatus: 'idle',
      duration: await getAudioDuration(file)
    })));
    setFiles(prev => [...prev, ...audioFiles]);
  }, []);

  const removeFile = useCallback((id: string, type: 'audio' | 'processed' = 'audio') => {
    if (type === 'audio') {
      setFiles(prev => prev.filter(f => f.id !== id));
    } else {
      setProcessedResults(prev => prev.filter(r => r.id !== id));
    }
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
        id: targetFile.id,
        name: targetFile.name,
        content: targetFile.transcriptionResult
      });
    }
  };

  const handleViewProcessed = (id: string) => {
    const result = processedResults.find(r => r.id === id);
    if (result) setViewingProcessed(result);
  };


  const hasPending = files.some(f => f.status === 'pending');
  const hasFiles = files.length > 0;

  return (
    <div className={`app-container ${fontScale !== 1 ? 'scaled' : ''}`}>
      {showSplash && (
        <div className={!isInitializing ? 'fade-out' : ''}>
          <SplashScreen />
        </div>
      )}

      {showIPhoneTip && (
        <div className="iphone-tip glass-panel animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="tip-icon">✨</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Install iConvert</p>
              <p className="text-xs opacity-70">Tap the share icon and select "Add to Home Screen" for the best experience.</p>
            </div>
            <button onClick={() => setShowIPhoneTip(false)} className="close-mini">×</button>
          </div>
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
        onProcess={() => { }}
        isProcessing={false}
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

              {/* Middle Section: Multiple Lists */}
              {hasFiles && (
                <div className="content-lists-container animate-fade-in">

                  {/* List 1: Queue */}
                  {files.some(f => f.transcriptionStatus !== 'done') && (
                    <div className="queue-section mb-8">
                      <div className="queue-header mb-2">
                        <div className="queue-title-group">
                          <span className="queue-label">{t.queue || 'Queue'}</span>
                          <span className="queue-count">{files.filter(f => f.transcriptionStatus !== 'done').length}</span>
                        </div>
                      </div>
                      <FileList
                        files={files.filter(f => f.transcriptionStatus !== 'done')}
                        onRemove={removeFile}
                        onConvert={startConversion}
                        onTranscribe={transcribeFile}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="queue"
                      />
                    </div>
                  )}

                  {/* List 2: Transcribed Audios */}
                  {files.some(f => f.transcriptionStatus === 'done') && (
                    <div className="transcribed-section mb-8">
                      <div className="queue-header mb-2">
                        <div className="queue-title-group">
                          <span className="queue-label">Transcribed Audios</span>
                          <span className="queue-count">{files.filter(f => f.transcriptionStatus === 'done').length}</span>
                        </div>
                      </div>
                      <FileList
                        files={files.filter(f => f.transcriptionStatus === 'done')}
                        onRemove={removeFile}
                        onViewTranscript={handleViewTranscript}
                        onDownloadTranscript={downloadTranscript}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="transcribed"
                      />
                    </div>
                  )}

                  {/* List 3: Processed Results */}
                  {processedResults.length > 0 && (
                    <div className="processed-section mb-8">
                      <div className="queue-header mb-2">
                        <div className="queue-title-group">
                          <span className="queue-label">Processed Results</span>
                          <span className="queue-count">{processedResults.length}</span>
                        </div>
                      </div>
                      <FileList
                        processedResults={processedResults}
                        onRemove={removeFile}
                        onViewProcessed={handleViewProcessed}
                        hasApiKey={!!apiKey}
                        t={t}
                        type="processed"
                      />
                    </div>
                  )}

                </div>
              )}

              {/* Bottom Section: Controls & Actions (only for queue) */}
              {files.some(f => f.status === 'pending' || (f.status === 'completed' && f.transcriptionStatus === 'idle')) && (
                <div className="controls-section border-t pt-6 mt-4">
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
              )}
            </div>


            {/* Footer / Tip */}
            <div className="footer-tip animate-fade-in">
              <p>
                iConvert Audio, by Bella Labs, V0.1.4
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
