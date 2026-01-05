
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
      document.body.style.backgroundColor = '#09090b'; // zinc-950
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#fafafa'; // zinc-50
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

  const hasPending = files.some(f => f.status === 'pending');
  const hasFiles = files.length > 0;

  return (
    <div className="min-h-screen text-zinc-950 dark:text-zinc-50 font-sans selection:bg-indigo-500/30">
      <Header lang={lang} setLang={setLang} isDark={isDark} setIsDark={setIsDark} t={t} />
      
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 w-full">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
            <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{t.initializing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-xl p-8 text-center shadow-xl shadow-red-500/5">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2">{t.engineError}</h2>
              <p className="text-sm text-zinc-500 mb-6">{t.engineDesc}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.retry}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Main Studio Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden relative">
              
              {/* Top Section: Upload */}
              <div className={`transition-all duration-500 ease-in-out ${hasFiles ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
                <DropZone onFilesAdded={onFilesAdded} compact={hasFiles} t={t} />
              </div>

              {/* Middle Section: Queue */}
              {hasFiles && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-zinc-50/50 dark:bg-black/20 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex items-center space-x-2">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.queue}</span>
                       <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-bold">{files.length}</span>
                    </div>
                    <button 
                      onClick={clearCompleted}
                      className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      {t.clear}
                    </button>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <FileList files={files} onRemove={removeFile} onConvert={startConversion} t={t} />
                  </div>
                </div>
              )}

              {/* Bottom Section: Controls & Actions */}
              <div className="p-5 bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
                 <Settings options={options} setOptions={setOptions} t={t} />
                 
                 <div className="mt-6">
                   <button 
                     onClick={convertAll}
                     disabled={!hasPending}
                     className={`
                       w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg transition-all transform active:scale-[0.98]
                       ${hasPending 
                         ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
                         : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'}
                     `}
                   >
                     {hasPending ? t.runProcess : t.start}
                   </button>
                 </div>
              </div>
            </div>

            {/* Footer / Tip */}
            <div className="mt-8 text-center opacity-0 animate-in fade-in duration-1000 delay-300 fill-mode-forwards">
               <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">
                 {t.footerText}
               </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
