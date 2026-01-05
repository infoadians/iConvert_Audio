
import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, compact }) => {
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
        relative border-2 border-dashed rounded-3xl transition-all duration-300 group overflow-hidden
        ${compact ? 'p-6' : 'p-16 md:p-24'}
        ${isDragging 
          ? 'border-indigo-600 bg-indigo-50/50 scale-[1.02] shadow-2xl shadow-indigo-100' 
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50'
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
          ${compact ? 'w-12 h-12' : 'w-20 h-20'}
          ${isDragging 
            ? 'bg-indigo-600 text-white rotate-12 scale-110' 
            : 'bg-indigo-50 text-indigo-500 group-hover:scale-105 group-hover:-rotate-3'
          }
        `}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={compact ? 'w-6 h-6' : 'w-10 h-10'}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="text-center">
          <p className={`${compact ? 'text-base' : 'text-2xl'} font-extrabold text-slate-800 tracking-tight transition-all`}>
            {isDragging ? 'Release to add audio' : 'Add more audio tracks'}
          </p>
          {!compact && (
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
              Drag & drop your iPhone Voice Memos or high-res audio files here.
            </p>
          )}
        </div>

        <div className={`
          px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all
          group-hover:border-indigo-200 group-hover:text-indigo-600 group-hover:shadow-md
          ${compact ? 'hidden' : 'block'}
        `}>
          Choose Files
        </div>
      </div>
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
    </div>
  );
};
