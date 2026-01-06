
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
        className={`dropzone-container compact ${isDragging ? 'dragging' : ''}`}
      >
        <input type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="dropzone-input" />
        <div className="dropzone-icon-box">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {isDragging ? t.dropActive : t.dropTitle}
        </span>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
      className={`dropzone-container ${isDragging ? 'dragging' : ''}`}
    >
      <input type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4" onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="dropzone-input" />

      <div className="dropzone-icon-box">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>

      <div className="dropzone-text">
        <h3>{isDragging ? t.dropActive : t.dropTitle}</h3>
        <p>{t.dropSubtitle}</p>
      </div>

      <div className="mt-6">
        <span className="dropzone-btn">
          {t.chooseFiles}
        </span>
      </div>
    </div>
  );
};
