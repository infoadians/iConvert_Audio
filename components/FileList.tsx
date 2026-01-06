
import React from 'react';
import { AudioFile, ProcessedResult } from '../types';

interface FileListProps {
  files?: AudioFile[];
  processedResults?: ProcessedResult[];
  onRemove: (id: string, type?: 'audio' | 'processed') => void;
  onConvert?: (id: string) => void;
  onTranscribe?: (id: string) => void;
  onDownloadTranscript?: (id: string, format: 'txt' | 'md') => void;
  onViewTranscript?: (id: string) => void;
  onViewProcessed?: (id: string) => void;
  hasApiKey: boolean;
  t: any;
  type: 'queue' | 'transcribed' | 'processed';
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
      <div className="file-list-group">
        {processedResults.map((item) => (
          <div key={item.id} className="file-item glass-card-hover">
            <div className="file-item-left">
              <div className="file-icon-box completed">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="file-info">
                <h4 className="file-name truncate" style={{ maxWidth: '200px' }}>{item.audioFileName}</h4>
                <div className="file-meta-row">
                  <span className="status-badge processing">{item.templateName}</span>
                </div>
              </div>
            </div>
            <div className="file-actions">
              <button
                onClick={() => onViewProcessed && onViewProcessed(item.id)}
                className="action-btn-secondary"
              >
                {t.view || 'View'}
              </button>
              <button onClick={() => onRemove(item.id, 'processed')} className="remove-btn" title="Remove Result">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="file-list-group">
      {files.map((item) => (
        <div key={item.id} className="file-item glass-card-hover">

          <div className="file-item-left">
            {/* Status Icon */}
            <div className={`file-icon-box ${item.status === 'completed' ? 'completed' :
              (item.status === 'converting' || item.transcriptionStatus === 'processing') ? 'converting' :
                (item.status === 'error' || item.transcriptionStatus === 'error') ? 'error' : 'idle'
              }`}>
              {item.status === 'completed' ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (item.status === 'converting' || item.transcriptionStatus === 'processing') ? (
                <div className="spinner-micro"></div>
              ) : (item.status === 'error' || item.transcriptionStatus === 'error') ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              )}
            </div>

            {/* File Info */}
            <div className="file-info">
              <h4 className="file-name">{item.name}</h4>
              <div className="file-meta-row">
                <span className="file-size">{formatSize(item.size)}</span>
                {item.duration && <span className="file-duration">• {formatDuration(item.duration)}</span>}

                {/* Visual Progress Bar */}
                {(item.status === 'converting' || item.transcriptionStatus === 'processing') && (
                  <div className="file-progress-track">
                    <div
                      className="file-progress-fill"
                      style={{ width: `${item.status === 'converting' ? item.progress : 100}%` }}
                    ></div>
                  </div>
                )}

                {/* Status Badges */}
                {item.transcriptionStatus === 'processing' && (
                  <span className="status-badge processing">{t.transcribing}</span>
                )}
                {item.status === 'completed' && (
                  <span className="status-badge success">Converted</span>
                )}
                {item.transcriptionStatus === 'done' && (
                  <span className="status-badge success">Transcribed</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="file-actions">
            {type === 'queue' && (
              <>
                {item.status === 'pending' && onConvert && (
                  <button onClick={() => onConvert(item.id)} className="action-btn-secondary">
                    {t.convert}
                  </button>
                )}
                {item.status === 'completed' && item.transcriptionStatus !== 'done' && hasApiKey && onTranscribe && (
                  <button onClick={() => onTranscribe(item.id)} className="action-btn-secondary" disabled={item.transcriptionStatus === 'processing'}>
                    {item.transcriptionStatus === 'processing' ? t.processing : t.transcribe}
                  </button>
                )}
                {item.status === 'completed' && item.outputUrl && (
                  <a
                    href={item.outputUrl}
                    download={item.outputName}
                    className="action-btn-icon wobble-hover"
                    title="Download MP3"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                )}
              </>
            )}

            {type === 'transcribed' && (
              <>
                {onViewTranscript && (
                  <button onClick={() => onViewTranscript(item.id)} className="action-btn-secondary">
                    {t.view || 'View'}
                  </button>
                )}
                {onDownloadTranscript && (
                  <button onClick={() => onDownloadTranscript(item.id, 'txt')} className="action-btn-icon" title="Download Transcript">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
              </>
            )}

            <button onClick={() => onRemove(item.id, 'audio')} className="remove-btn" title="Remove File">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

