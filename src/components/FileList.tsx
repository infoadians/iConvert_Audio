import React from 'react';
import { AudioFile, ProcessedResult, DocumentFile } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileAudio, CheckCircle, AlertTriangle, Eye, Trash2, Download, FileText, Music, FileType } from 'lucide-react';

interface FileListProps {
  files?: AudioFile[];
  processedResults?: ProcessedResult[];
  documents?: DocumentFile[];
  onRemove: (id: string, type?: 'audio' | 'processed' | 'document') => void;
  onConvert?: (id: string) => void;
  onTranscribe?: (id: string) => void;
  onDownloadTranscript?: (id: string, format: 'txt' | 'md') => void;
  onViewTranscript?: (id: string) => void;
  onViewProcessed?: (id: string) => void;
  hasApiKey: boolean;
  t: any;
  type: 'queue' | 'transcribed' | 'processed' | 'documents';
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
  if (seconds === undefined || isNaN(seconds)) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FileList: React.FC<FileListProps> = ({
  files = [],
  processedResults = [],
  documents = [],
  onRemove,
  onConvert,
  onTranscribe,
  onDownloadTranscript,
  onViewTranscript,
  onViewProcessed,
  hasApiKey,
  t,
  type
}) => {
  if (type === 'processed') {
    return (
      <div className="grid gap-3">
        {processedResults.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="w-full">
                <h4 className="text-sm font-medium break-words leading-tight">{item.audioFileName}</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground inline-flex items-center px-2 py-0.5 rounded-full bg-secondary">
                      {item.templateName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                    onClick={() => onViewProcessed && onViewProcessed(item.id)}
                  >
                    {t.view || 'View'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemove(item.id, 'processed')} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'documents') {
    return (
      <div className="grid gap-3">
        {documents.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="w-full">
                <h4 className="text-sm font-medium break-words leading-tight">{item.name}</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500">
                    <FileType className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{formatSize(item.size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                    onClick={() => onViewTranscript && onViewTranscript(item.id)}
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    {t.view || 'View'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemove(item.id, 'document')} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {files.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-full">
              <h4 className="text-sm font-medium break-words leading-tight">{item.name}</h4>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                {/* Icon Status */}
                <div className="min-w-[40px] flex-shrink-0">
                  {item.status === 'completed' ? (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (item.status === 'converting' || item.transcriptionStatus === 'processing') ? (
                    <div className="h-10 w-10 flex items-center justify-center">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                  ) : (item.status === 'error' || item.transcriptionStatus === 'error') ? (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Music className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>{formatSize(item.size)}</span>
                    {item.duration && <span>• {formatDuration(item.duration)}</span>}

                    {item.transcriptionStatus === 'processing' && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">{t.transcribing}</span>}
                    {item.status === 'completed' && type === 'queue' && <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Converted</span>}
                    {item.transcriptionStatus === 'done' && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Transcribed</span>}
                  </div>
                  {(item.status === 'converting' || item.transcriptionStatus === 'processing') && (
                    <Progress value={item.status === 'converting' ? item.progress : 100} className="h-1 mt-2" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {type === 'queue' && (
                  <>
                    {item.status === 'pending' && onConvert && (
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm" onClick={() => onConvert(item.id)}>
                        {t.convert}
                      </Button>
                    )}
                    {item.status === 'completed' && item.transcriptionStatus !== 'done' && hasApiKey && onTranscribe && item.transcriptionStatus !== 'processing' && (
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                        onClick={() => onTranscribe(item.id)}
                      >
                        <FileText className="mr-2 h-3.5 w-3.5" />
                        {t.transcribe}
                      </Button>
                    )}
                    {item.status === 'completed' && item.outputUrl && (
                      <Button size="icon" variant="outline" asChild className="h-9 w-9">
                        <a href={item.outputUrl} download={item.outputName} title="Download MP3">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </>
                )}

                {type === 'transcribed' && (
                  <>
                    {onViewTranscript && (
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm" onClick={() => onViewTranscript(item.id)}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        {t.view}
                      </Button>
                    )}
                    {onDownloadTranscript && (
                      <Button variant="outline" size="icon" onClick={() => onDownloadTranscript(item.id, 'txt')} title="Download Transcript">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}

                <Button variant="ghost" size="icon" onClick={() => onRemove(item.id, 'audio')} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

