
import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  compact?: boolean;
  t: any;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, compact, t }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-[2rem] transition-all duration-500 group overflow-hidden
        ${compact ? 'p-6' : 'p-16 md:p-24'}
        ${isDragging 
          ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10 scale-[1.01] shadow-2xl shadow-indigo-100 dark:shadow-none' 
          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-500/50'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none relative z-0">
        <div className={`
          rounded-2xl flex items-center justify-center transition-all duration-500
          ${compact ? 'w-10 h-10' : 'w-16 h-16'}
          ${isDragging 
            ? 'bg-indigo-600 text-white rotate-12 scale-110' 
            : 'bg-indigo-50 dark:bg-zinc-800 text-indigo-500 group-hover:scale-110 group-hover:-rotate-3'
          }
        `}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={compact ? 'w-5 h-5' : 'w-8 h-8'}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="text-center">
          <p className={`${compact ? 'text-sm' : 'text-xl'} font-bold tracking-tight text-slate-800 dark:text-zinc-100`}>
            {isDragging ? t.dropActive : t.dropTitle}
          </p>
          {!compact && (
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2 font-medium max-w-[200px] mx-auto leading-relaxed">
              {t.dropSubtitle}
            </p>
          )}
        </div>

        <div className={`
          px-5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 shadow-sm
          ${compact ? 'hidden' : 'block'}
        `}>
          {t.chooseFiles}
        </div>
      </div>
      
      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
    </div>
  );
};
