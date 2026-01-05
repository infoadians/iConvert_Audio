
import React from 'react';
import { AudioFile } from '../types';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onConvert: (id: string) => void;
  t: any;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onConvert, t }) => {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {files.map((item) => (
        <div key={item.id} className="group flex items-center p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
          
          {/* Status Icon */}
          <div className="shrink-0 mr-4">
             {item.status === 'completed' ? (
               <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                 <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
             ) : item.status === 'converting' ? (
               <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin"></div>
             ) : item.status === 'error' ? (
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
              {item.status === 'converting' && (
                <div className="h-1 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {item.status === 'completed' && item.outputUrl && (
              <a 
                href={item.outputUrl} 
                download={item.outputName}
                className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              >
                {t.download}
              </a>
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
