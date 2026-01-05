
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
    // Dark mode class management
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
        console.error("Failed to load FFmpeg:", error);
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
      const { url, name } = await ffmpegManager.convert(
        targetFile.file, 
        options,
        (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === id ? { ...f, progress: Math.round(progress * 100) } : f
          ));
        }
      );

      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'completed', 
          outputUrl: url, 
          outputName: name,
          progress: 100 
        } : f
      ));
    } catch (err: any) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'error', error: err.message || 'Conversion failed' } : f
      ));
    }
  }, [files, options]);

  const convertAll = useCallback(() => {
    files.forEach(file => {
      if (file.status === 'pending') {
        startConversion(file.id);
      }
    });
  }, [files, startConversion]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      <Header 
        lang={lang} 
        setLang={setLang} 
        isDark={isDark} 
        setIsDark={setIsDark} 
        t={t} 
      />
      
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 flex-grow w-full space-y-8">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-2 border-slate-200 dark:border-zinc-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className="text-sm font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase">{t.initializing}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-600 mt-2">{t.preparing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 rounded-3xl p-10 text-center shadow-xl max-w-xl mx-auto">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3">{t.engineError}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-8">
              {t.engineDesc} <br/><code className="text-red-500 text-xs mt-2 block">{initError}</code>
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95"
            >
              {t.retry}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Action Bar */}
            {files.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {files.slice(0, 3).map((f) => (
                      <div key={f.id} className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-md">
                        {f.name.charAt(0)}
                      </div>
                    ))}
                    {files.length > 3 && (
                      <div className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-zinc-400 font-bold">
                        +{files.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-none">{t.queue}</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5">
                      {files.filter(f => f.status === 'completed').length} / {files.length} {t.processed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={clearCompleted}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    {t.reset}
                  </button>
                  <button 
                    onClick={convertAll}
                    disabled={!files.some(f => f.status === 'pending')}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>{t.runProcess}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-8">
                <DropZone onFilesAdded={onFilesAdded} compact={files.length > 0} t={t} />
                
                {files.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                      <h2 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{t.workbench}</h2>
                      <span className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 tracking-widest">{t.privateEnclave}</span>
                    </div>
                    <FileList 
                      files={files} 
                      onRemove={removeFile} 
                      onConvert={startConversion} 
                      t={t}
                    />
                  </div>
                )}
              </div>

              <div className="lg:col-span-4">
                <Settings options={options} setOptions={setOptions} t={t} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-16 text-center border-t border-slate-100 dark:border-zinc-900 mt-20 mb-24 md:mb-0 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-300 dark:text-zinc-700 tracking-[0.4em] uppercase mb-4">
            {t.subtitle}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed font-medium italic">
            {t.footerText}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-12 gap-y-3 text-[8px] font-black text-slate-300 dark:text-zinc-800 uppercase tracking-widest">
            <span>{t.serverless}</span>
            <span>{t.zeroRetention}</span>
            <span>{t.edgeOpt}</span>
            <span>{t.offlineLab}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
