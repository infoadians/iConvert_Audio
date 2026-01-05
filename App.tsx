
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { Settings } from './components/Settings';
import { AudioFile, ConversionOptions } from './types';
import { FFmpegManager } from './services/ffmpegService';

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    bitrate: '192k',
    sampleRate: '44100',
  });

  const ffmpegManager = FFmpegManager.getInstance();

  useEffect(() => {
    const init = async () => {
      try {
        await ffmpegManager.load();
        setIsFFmpegLoaded(true);
      } catch (error: any) {
        console.error("Failed to load FFmpeg:", error);
        setInitError(error.message || "Failed to load audio engine");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex-grow w-full space-y-6">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-bold tracking-tight text-slate-700">Studio Initializing</p>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mt-2">Preparing secure sandbox...</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="bg-white border-2 border-red-100 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl shadow-red-50/50 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Engine Failed to Start</h2>
            <p className="text-slate-500 leading-relaxed mb-8 font-medium">
              We encountered a security origin error ({initError}). This usually happens when browsing from restricted environments. 
              Try opening the site directly in a new tab or modern browser.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Action Bar / Summary */}
            {files.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {files.slice(0, 3).map((f) => (
                      <div key={f.id} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-md">
                        {f.name.charAt(0)}
                      </div>
                    ))}
                    {files.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black shadow-md">
                        +{files.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">Audio Lab Workflow</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{files.filter(f => f.status === 'completed').length} / {files.length} processed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={clearCompleted}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    Reset Done
                  </button>
                  <button 
                    onClick={convertAll}
                    disabled={!files.some(f => f.status === 'pending')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-indigo-200 transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Run Studio Process</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Input & Files */}
              <div className="lg:col-span-8 space-y-6">
                <div className={`${files.length > 0 ? 'scale-[0.98] opacity-90 hover:scale-100 hover:opacity-100' : 'scale-100'} transition-all duration-500 origin-top`}>
                  <DropZone onFilesAdded={onFilesAdded} compact={files.length > 0} />
                </div>
                
                {files.length > 0 && (
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                      <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Workbench Registry</h2>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 tracking-widest">PRIVATE ENCLAVE</span>
                    </div>
                    <FileList 
                      files={files} 
                      onRemove={removeFile} 
                      onConvert={startConversion} 
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Settings */}
              <div className="lg:col-span-4">
                <Settings options={options} setOptions={setOptions} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-16 text-center border-t border-slate-100 mt-20 mb-24 md:mb-0 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4 opacity-20 grayscale">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 1v22M5 8v8M19 8v8M8 12v0M16 12v0M2 10v4M22 10v4" />
            </svg>
            <span className="font-black tracking-tighter text-xl">iConvert</span>
          </div>
          <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">
            Studio Professional
          </p>
          <p className="text-[10px] text-slate-400 font-bold">
            iConvert Audio, by Bella Labs, V1.3
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            <span>Serverless Processing</span>
            <span>Zero-Data Retention</span>
            <span>Edge Optimization</span>
            <span>Offline Laboratory</span>
          </div>
        </div>
      </footer>

      {/* Optimized Mobile Action Bar */}
      {files.some(f => f.status === 'pending') && (
        <div className="fixed bottom-0 inset-x-0 bg-white/70 backdrop-blur-2xl border-t border-slate-100 p-6 pb-10 md:hidden z-50 animate-in slide-in-from-bottom duration-500">
          <button 
            onClick={convertAll}
            className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] shadow-2xl shadow-indigo-200 active:scale-[0.97] transition-all flex items-center justify-center space-x-3"
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span>Run All Tracks</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
