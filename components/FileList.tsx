
import React from 'react';
import { AudioFile } from '../types';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onConvert: (id: string) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onConvert }) => {
  return (
    <div className="divide-y divide-slate-100">
      {files.map((item) => (
        <div 
          key={item.id} 
          className={`
            group p-5 transition-all flex items-center justify-between gap-6
            ${item.status === 'converting' ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'}
          `}
        >
          {/* File Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white
              ${item.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}
              ${item.status === 'converting' ? 'animate-pulse bg-indigo-100 text-indigo-600' : ''}
              ${item.status === 'error' ? 'bg-red-100 text-red-600' : ''}
            `}>
              {item.status === 'completed' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate flex items-center group-hover:text-indigo-600 transition-colors" title={item.name}>
                {item.name}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{formatSize(item.size)}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'pending' ? 'text-slate-400' : 
                  item.status === 'converting' ? 'text-indigo-500' : 
                  item.status === 'completed' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-4">
            {item.status === 'pending' && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onConvert(item.id)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  Start
                </button>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}

            {item.status === 'converting' && (
              <div className="flex flex-col items-end space-y-1">
                <div className="text-[10px] font-bold text-indigo-600 tabular-nums">
                  PROCESSING {item.progress}%
                </div>
                <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}

            {item.status === 'completed' && item.outputUrl && (
              <div className="flex items-center space-x-2">
                <a 
                  href={item.outputUrl} 
                  download={item.outputName}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Download</span>
                </a>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {item.status === 'error' && (
              <div className="flex items-center space-x-2">
                <div className="text-right mr-2">
                  <p className="text-[10px] font-bold text-red-600 uppercase">Failed</p>
                  <p className="text-[9px] text-slate-400 truncate max-w-[80px]">{item.error}</p>
                </div>
                <button 
                  onClick={() => onConvert(item.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
