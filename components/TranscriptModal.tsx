import React, { useState } from 'react';
import { ProcessTemplate } from '../types';

interface TranscriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    content: string;
    templates: ProcessTemplate[];
    onProcess: (template: ProcessTemplate) => void;
    isProcessing: boolean;
    t: any;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
    isOpen, onClose, fileName, content, templates, onProcess, isProcessing, t
}) => {
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md' = 'txt') => {
        const type = format === 'md' ? 'text/markdown' : 'text/plain';
        const ext = format === 'md' ? 'md' : 'txt';
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName.split('.')[0]}_transcript.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h3 className="modal-title">{fileName}</h3>
                    </div>
                    <button onClick={onClose} className="modal-close-btn">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative mb-6 flex-1 min-h-0">
                    <textarea
                        readOnly
                        value={isProcessing ? t.processing : content}
                        className={`w-full h-full p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-mono leading-relaxed resize-none focus:outline-none text-zinc-800 dark:text-zinc-200 ${isProcessing ? 'animate-pulse' : ''}`}
                        style={{ minHeight: '300px' }}
                    />
                </div>

                <div className="modal-actions">
                    <div className="process-menu-container">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="action-btn-secondary"
                            disabled={isProcessing}
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2-2 0 00-2-2M5 11V9a2-2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <span>{t.process}</span>
                        </button>

                        {isMenuOpen && (
                            <div className="process-dropdown">
                                {templates.map(tmp => (
                                    <button
                                        key={tmp.id}
                                        className="process-item"
                                        onClick={() => {
                                            onProcess(tmp);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        {tmp.name}
                                    </button>
                                ))}
                                {templates.length === 0 && (
                                    <div className="process-item opacity-50 text-xs">{t.noTemplates || 'No templates'}</div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCopy}
                        className="action-btn-secondary"
                    >
                        {copied ? (
                            <>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleDownload('txt')}
                        className="action-btn-primary"
                    >
                        <span>TXT</span>
                    </button>
                    <button
                        onClick={() => handleDownload('md')}
                        className="action-btn-primary"
                    >
                        <span>MD</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
