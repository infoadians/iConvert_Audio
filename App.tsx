
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
            <p>Your browser doesn't support the high-performance audio engine required for conversion. Please try a modern browser like Chrome, Edge, or Safari.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <DropZone onFilesAdded={onFilesAdded} />
            
            {files.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-slate-700">Queue ({files.length})