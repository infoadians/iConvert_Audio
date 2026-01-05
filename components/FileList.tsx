
import React from 'react';
import { AudioFile } from '../types';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onConvert: (id: string) => void;
  onTranscribe: (id: string) => void;
  onDownloadTranscript: (id: string, format: 'txt' | 'md') => void;
  hasApiKey: boolean;
  t: any;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onConvert, onTranscribe, onDownloadTranscript, hasApiKey, t }) => {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {files.map((item) => (
        <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors gap-4 sm:gap-0">
          
          <div className="flex items-center flex-1 min-w-0">
            {/* Status Icon */}
            <div className="shrink-0 mr-4">
              {item.status === 'completed' ? (
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : item.status === 'converting' || item.transcriptionStatus === 'processing' ? (
                <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              ) : item.status === 'error' || item.transcriptionStatus === 'error' ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 mr-4">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h4>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] font-mono text-zinc-400">{formatSize(item.size)}</span>
                {(item.status === 'converting' || item.transcriptionStatus === 'processing') && (
                  <div className="h-1 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${item.status === 'converting' ? item.progress : 90}%` }}></div>
                  </div>
                )}
                {item.transcriptionStatus === 'processing' && (
                   <span className="text-[10px] text-indigo-500 font-medium animate-pulse">{t.transcribing}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto ml-12 sm:ml-0">
            
            {/* Download Converted Audio */}
            {item.status === 'completed' && item.outputUrl && (
              <a 
                href={item.outputUrl} 
                download={item.outputName}
                className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              >
                {t.download}
              </a>
            )}

            {/* AI Transcription Actions */}
            {hasApiKey && item.status !== 'converting' && item.transcriptionStatus !== 'processing' && (
               <>
                 {item.transcriptionStatus === 'done' ? (
                   <div className="flex gap-1">
                      <button
                        onClick={() => onDownloadTranscript(item.id, 'txt')}
                        className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t.downloadTxt}
                      </button>
                      <button
                        onClick={() => onDownloadTranscript(item.id, 'md')}
                        className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t.downloadMd}
                      </button>
                   </div>
                 ) : (
                    <button
                      onClick={() => onTranscribe(item.id)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                      {t.transcribe}
                    </button>
                 )}
               </>
            )}
            
            <button 
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
