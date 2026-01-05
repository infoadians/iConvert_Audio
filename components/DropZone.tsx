
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
        relative group cursor-pointer
        border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out
        ${compact ? 'py-8 px-6' : 'py-16 px-8 md:py-24'}
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600'
        }
      `}
    >
      <input 
        type="file" 
        multiple 
        accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" 
        onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
      />
      
      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
        <div className={`
          rounded-full flex items-center justify-center transition-all duration-200 mb-4
          ${compact ? 'w-10 h-10' : 'w-14 h-14'}
          ${isDragging 
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' 
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
          }
        `}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        
        <h3 className={`font-semibold text-zinc-900 dark:text-zinc-100 ${compact ? 'text-sm' : 'text-lg'}`}>
          {isDragging ? t.dropActive : t.dropTitle}
        </h3>
        
        {!compact && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {t.dropSubtitle}
          </p>
        )}
        
        {!compact && (
           <div className="mt-6 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md shadow-sm group-hover:opacity-90 transition-opacity">
            {t.chooseFiles}
           </div>
        )}
      </div>
    </div>
  );
};
