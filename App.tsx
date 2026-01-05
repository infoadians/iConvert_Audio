
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
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 mt-8 flex-grow w-full">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium">Initializing audio engine...</p>
            <p className="text-sm">This may take a moment on first load.</p>
          </div>
        ) : !isFFmpegLoaded ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">
            <h2 className="text-xl font-bold mb-2">Browser Support Issue</h2>
            <p>Your browser requires special headers for high-performance audio conversion. Ensure you are visiting the official deployment URL.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <DropZone onFilesAdded={onFilesAdded} />
            
            {files.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-slate-700">Queue ({files.length})</h2>
                    <button 
                      onClick={convertAll}
                      disabled={!files.some(f => f.status === 'pending')}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Convert All
                    </button>
                  </div>
                  <FileList 
                    files={files} 
                    onRemove={removeFile} 
                    onConvert={startConversion} 
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <Settings options={options} setOptions={setOptions} />
                </div>
              </div>
            )}

            {files.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>No files selected. Upload your iPhone recordings to start.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full py-8 text-center border-t border-slate-200 mt-12 mb-20 md:mb-0 bg-white/50">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          iConvert Audio, by Bella Labs, V1.1
        </p>
      </footer>

      {/* Persistent Mobile Bottom Bar */}
      {files.some(f => f.status === 'pending') && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 md:hidden z-20">
          <button 
            onClick={convertAll}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
            Start Converting {files.filter(f => f.status === 'pending').length} Files
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
