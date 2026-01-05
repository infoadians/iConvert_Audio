
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

  if (compact) {
    return (
      <div 
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        className={`
          relative group cursor-pointer p-4 flex items-center justify-center space-x-3 transition-colors
          ${isDragging ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
        `}
      >
         <input type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
         <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
         </div>
         <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
           {isDragging ? t.dropActive : t.dropTitle}
         </span>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
      className={`
        relative group cursor-pointer flex flex-col items-center justify-center text-center
        transition-all duration-300 ease-out
        py-20 px-8
        ${isDragging ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-white dark:bg-zinc-900'}
      `}
    >
      <input type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      
      <div className={`
        w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 mb-6 flex items-center justify-center 
        group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-zinc-800
        ${isDragging ? 'scale-110 border-indigo-200 ring-4 ring-indigo-50' : ''}
      `}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
        {isDragging ? t.dropActive : t.dropTitle}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
        {t.dropSubtitle}
      </p>
      
      <div className="mt-8">
        <span className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-lg shadow-xl shadow-zinc-200 dark:shadow-none group-hover:translate-y-[-2px] transition-transform inline-block">
          {t.chooseFiles}
        </span>
      </div>
    </div>
  );
};
