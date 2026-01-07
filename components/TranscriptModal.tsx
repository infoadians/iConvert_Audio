import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
//@ts-ignore
import html2pdf from 'html2pdf.js';
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
    const [fontSize, setFontSize] = useState(16);
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pdfContentRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md' | 'pdf' = 'txt') => {
        if (format === 'pdf') {
            const element = pdfContentRef.current;
            if (!element) return;
            const opt = {
                margin: 1,
                filename: `${fileName.split('.')[0]}_transcript.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
            return;
        }

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card full-window-modal" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close-btn-large">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Line 1: Zoom Controls */}
                <div className="modal-header-line-1">
                    <div className="font-controls">
                        <button
                            className="font-btn"
                            onClick={() => setFontSize(f => Math.max(10, f - 2))}
                            title="Decrease text size"
                        >−</button>
                        <span className="font-size-display">{fontSize}px</span>
                        <button
                            className="font-btn"
                            onClick={() => setFontSize(f => Math.min(48, f + 2))}
                            title="Increase text size"
                        >+</button>
                    </div>
                </div>

                {/* Line 2: Title */}
                <div className="modal-header-line-2">
                    <h3 className="modal-title-main truncate">{fileName}</h3>
                </div>

                <div className="modal-body-expanded">
                    <div
                        ref={pdfContentRef}
                        className={`markdown-content-viewer p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 ${isProcessing ? 'animate-pulse' : ''}`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <ReactMarkdown>
                            {isProcessing ? "Processing with AI..." : content}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="modal-actions-raised">
                    <div className="process-menu-wrapper">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="action-btn-secondary raised"
                            disabled={isProcessing}
                        >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2-2 0 00-2-2M5 11V9a2-2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <span>{t.process}</span>
                        </button>

                        {isMenuOpen && (
                            <div className="process-dropdown-centered">
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

                    <button onClick={handleCopy} className="action-btn-secondary raised">
                        {copied ? (
                            <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Copied</span></>
                        ) : (
                            <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>Copy</span></>
                        )}
                    </button>

                    <button onClick={() => handleDownload('pdf')} className="action-btn-primary raised">
                        <span>PDF</span>
                    </button>
                    <button onClick={() => handleDownload('txt')} className="action-btn-primary raised">
                        <span>TXT</span>
                    </button>
                    <button onClick={() => handleDownload('md')} className="action-btn-primary raised">
                        <span>MD</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

