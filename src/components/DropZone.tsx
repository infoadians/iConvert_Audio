
import React, { useState, useCallback } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer flex items-center justify-center gap-3",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
        onClick={() => document.getElementById('file-input-compact')?.click()}
      >
        <input
          id="file-input-compact"
          type="file" multiple accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4"
          onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))}
          className="hidden"
        />
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {isDragging ? t.dropActive : t.dropTitle}
        </span>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
      className={cn(
        "relative group border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center gap-4",
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
      )}
      onClick={() => document.getElementById('file-input-main')?.click()}
    >
      <input
        id="file-input-main"
        type="file"
        multiple
        accept="audio/*,.m4a,.wav,.opus,.ogg,.mov,.mp4,.txt,.md,.docx"
        onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))}
        className="hidden"
      />

      <div className={cn("h-16 w-16 mb-2 rounded-full flex items-center justify-center transition-colors",
        isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10")}>
        <Upload className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          {t.dragDrop || "Drag & drop audio, DOCX, TXT, PDF, MD files here, or click to select"}
        </h3><p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">{t.dropSubtitle}</p>
      </div>

      <div className="mt-2">
        <Button variant="secondary" className="pointer-events-none">
          {t.chooseFiles}
        </Button>
      </div>
    </div>
  );
};
