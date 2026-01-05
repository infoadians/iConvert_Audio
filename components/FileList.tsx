
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
    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
      {files.map((item) => (
        <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-transparent ${item.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold truncate dark:text-white">{item.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">{formatSize(item.size)} • {t[item.status]}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {item.status === 'pending' && <button onClick={() => onConvert(item.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{t.start}</button>}
            {item.status === 'converting' && <span className="text-[10px] font-black text-indigo-500 tabular-nums">{item.progress}%</span>}
            {item.status === 'completed' && <a href={item.outputUrl} download={item.outputName} className="p-2 bg-indigo-600 text-white rounded-lg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg></a>}
            <button onClick={() => onRemove(item.id)} className="p-2 text-slate-300 hover:text-rose-500"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
          </div>
        </div>
      ))}
    </div>
  );
};
