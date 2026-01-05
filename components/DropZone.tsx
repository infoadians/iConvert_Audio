
import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
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
        relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 group
        ${isDragging 
          ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="audio/*,.m4a,.wav,.opus,.ogg,.mov"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}
        `}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Drop your audio here' : 'Select or drag your audio files'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supports iPhone recordings, M4A, WAV, Opus & more
          </p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm group-hover:border-indigo-200 transition-colors">
          Browse Files
        </div>
      </div>
    </div>
  );
};
