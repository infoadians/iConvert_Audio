
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { Settings } from './components/Settings';
import { AudioFile, ConversionOptions } from './types';
import { FFmpegManager } from './services/ffmpegService';
import { translations, Language } from './i18n';

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    bitrate: '192k',
    sampleRate: '44100',
  });
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState(false);

  const t = translations[lang];
  const ffmpegManager = FFmpegManager.getInstance();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
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

  const onFilesAdded = useCallback((newFiles: File[]) => {
    const audioFiles: AudioFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...audioFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans antialiased transition-colors duration-200">
      <Header lang={lang} setLang={setLang} isDark={isDark} setIsDark={setIsDark} t={t} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">{t.initializing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-lg">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{t.engineError}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{t.engineDesc}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.retry}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-8 duration-500">
            <div className="lg:col-span-8 space-y-6">
              <DropZone onFilesAdded={onFilesAdded} compact={files.length > 0} t={t} />
              
              {files.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.queue}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {files.length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearCompleted} 
                        className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                      >
                        {t.reset}
                      </button>
                      <button 
                        onClick={convertAll}
                        disabled={!files.some(f => f.status === 'pending')}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.runProcess}
                      </button>
                    </div>
                  </div>
                  <FileList files={files} onRemove={removeFile} onConvert={startConversion} t={t} />
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Settings options={options} setOptions={setOptions} t={t} />
              
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-start space-x-3">
                  <svg width="20" height="20" className="text-indigo-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">{t.smartTip}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {t.tipText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium">
                  {t.footerText}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
