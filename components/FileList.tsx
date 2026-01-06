
import React from 'react';
import { AudioFile } from '../types';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onConvert: (id: string) => void;
  onTranscribe: (id: string) => void;
  onDownloadTranscript: (id: string, format: 'txt' | 'md') => void;
  onViewTranscript: (id: string) => void;
  hasApiKey: boolean;
  t: any;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList: React.FC<FileListProps> = ({
  files, onRemove, onConvert, onTranscribe, onDownloadTranscript, onViewTranscript, hasApiKey, t
}) => {
  return (
    <div className="file-list-group">
      {files.map((item) => (
        <div key={item.id} className="file-item">

          <div className="file-item-left">
            {/* Status Icon */}
            <div className={`file - icon - box ${item.status === 'completed' ? 'completed' :
                (item.status === 'converting' || item.transcriptionStatus === 'processing') ? 'converting' :
                  (item.status === 'error' || item.transcriptionStatus === 'error') ? 'error' : 'idle'
              } `}>
              {item.status === 'completed' ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (item.status === 'converting' || item.transcriptionStatus === 'processing') ? (
                null
              ) : (item.status === 'error' || item.transcriptionStatus === 'error') ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              )}
            </div>

            {/* File Info */}
            <div className="file-info">
              <h4 className="file-name">{item.name}</h4>
              <div className="file-meta-row">
                <span className="file-size">{formatSize(item.size)}</span>
                {(item.status === 'converting' || item.transcriptionStatus === 'processing') && (
                  <div className="file-progress-track">
                    <div className="file-progress-fill" style={{ width: `${item.status === 'converting' ? item.progress : 90}% ` }}></div>
                  </div>
                )}
                {item.transcriptionStatus === 'processing' && (
                  <span className="status-badge">{t.transcribing}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="file-actions">

            {/* Download Converted Audio */}
            {item.status === 'completed' && item.outputUrl && (
              <a
                href={item.outputUrl}
                download={item.outputName}
                className="action-btn download"
              >
                {t.download}
              </a>
            )}

            {/* AI Transcription Actions */}
            {hasApiKey && item.status !== 'converting' && item.transcriptionStatus !== 'processing' && (
              <>
                {item.transcriptionStatus === 'done' ? (
                  <>
                    <button onClick={() => onViewTranscript(item.id)} className="action-btn transcribe">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View
                    </button>
                    <button onClick={() => onDownloadTranscript(item.id, 'txt')} className="action-btn secondary">
                      TXT
                    </button>
                  </>
                ) : (
                  <button onClick={() => onTranscribe(item.id)} className="action-btn transcribe">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                    {t.transcribe}
                  </button>
                )}
              </>
            )}

            <button onClick={() => onRemove(item.id)} className="remove-btn">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
