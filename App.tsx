
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
      document.body.classList.add('bg-zinc-950');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-zinc-950');
      document.body.classList.add('bg-slate-50');
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
    <div className="min-h-screen transition-colors duration-300 flex flex-col">
      <Header lang={lang} setLang={setLang} isDark={isDark} setIsDark={setIsDark} t={t} />
      
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 flex-grow w-full space-y-10">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-500">
            <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-sm font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase">{t.initializing}</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center shadow-sm max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{t.engineError}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8">{t.engineDesc}</p>
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">{t.retry}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <DropZone onFilesAdded={onFilesAdded} compact={files.length > 0} t={t} />
              
              {files.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{t.workbench}</h2>
                    <div className="flex gap-4">
                      <button onClick={clearCompleted} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">{t.reset}</button>
                      <button onClick={convertAll} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.runProcess}</button>
                    </div>
                  </div>
                  <FileList files={files} onRemove={removeFile} onConvert={startConversion} t={t} />
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Settings options={options} setOptions={setOptions} t={t} />
              <div className="text-[10px] text-slate-400 dark:text-zinc-600 text-center leading-relaxed px-4">
                {t.footerText}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
