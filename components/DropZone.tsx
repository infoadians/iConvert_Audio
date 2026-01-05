
import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  compact?: boolean;
  t: any;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, compact, t }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-3xl transition-all duration-300 group
        ${compact ? 'p-6' : 'p-20 md:p-32'}
        ${isDragging 
          ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10' 
          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300'
        }
      `}
    >
      <input type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none relative z-0">
        <div className={`w-12 h-12 bg-indigo-50 dark:bg-zinc-800 text-indigo-500 rounded-2xl flex items-center justify-center transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold dark:text-white uppercase tracking-widest">{isDragging ? t.dropActive : t.dropTitle}</p>
          {!compact && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{t.dropSubtitle}</p>}
        </div>
      </div>
    </div>
  );
};
