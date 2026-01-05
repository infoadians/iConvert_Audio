
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
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
      {files.map((item) => (
        <div key={item.id} className="p-4 flex items-center justify-between group bg-white dark:bg-zinc-900 transition-colors">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border
              ${item.status === 'completed' 
                ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-900/20 dark:text-green-400' 
                : 'bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700/50 dark:text-zinc-500'}
            `}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{item.name}</h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{formatSize(item.size)}</span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
                <span className={`text-xs font-medium ${
                  item.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  item.status === 'error' ? 'text-red-600 dark:text-red-400' :
                  item.status === 'converting' ? 'text-indigo-600 dark:text-indigo-400' :
                  'text-zinc-500'
                }`}>
                  {t[item.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {item.status === 'pending' && (
              <button 
                onClick={() => onConvert(item.id)}
                className="hidden sm:inline-flex px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                {t.start}
              </button>
            )}

            {item.status === 'converting' && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{item.progress}%</span>
                <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            )}

            {item.status === 'completed' && item.outputUrl && (
              <a 
                href={item.outputUrl} 
                download={item.outputName}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                title={t.download}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l4.5-4.5m-4.5 4.5l-4.5-4.5M12 12.75V3" />
                </svg>
              </a>
            )}

            <button 
              onClick={() => onRemove(item.id)}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
              title={t.clear}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
