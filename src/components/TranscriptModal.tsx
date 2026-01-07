import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
//@ts-ignore
import html2pdf from 'html2pdf.js';
import { ProcessTemplate } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZoomIn, ZoomOut, X, FileText, Download, Copy, Play } from 'lucide-react';

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                {/* Header Line 1: Controls */}
                <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setFontSize(f => Math.max(10, f - 2))} title="Decrease text size">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-12 text-center">{fontSize}px</span>
                        <Button variant="ghost" size="icon" onClick={() => setFontSize(f => Math.min(48, f + 2))} title="Increase text size">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogTitle className="truncate flex-1 text-center px-4 font-semibold text-lg">{fileName}</DialogTitle>
                    {/* Close button is handled by DialogContent properties usually, but we can add explicit actions if needed */}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-muted/10">
                    <ScrollArea className="h-full w-full p-8">
                        <div
                            ref={pdfContentRef}
                            className={`markdown-content-viewer p-8 rounded-lg border bg-background text-foreground shadow-sm ${isProcessing ? 'animate-pulse' : ''}`}
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <ReactMarkdown>{isProcessing ? "Processing with AI..." : content}</ReactMarkdown>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer / Actions */}
                <div className="border-t p-4 flex items-center justify-between bg-background">
                    <div className="flex gap-2 relative">
                        <Button variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)} disabled={isProcessing}>
                            <Play className="mr-2 h-4 w-4" />
                            {t.process}
                        </Button>
                        {isMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-md border bg-popover text-popover-foreground shadow-lg z-50">
                                <div className="p-2 border-b flex justify-between items-center">
                                    <h4 className="font-medium text-xs uppercase text-muted-foreground">{t.templates || 'Select Template'}</h4>
                                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setIsMenuOpen(false)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="p-1 max-h-48 overflow-y-auto">
                                    {templates.map(tmp => (
                                        <Button
                                            key={tmp.id}
                                            variant="ghost"
                                            className="w-full justify-start text-sm h-8"
                                            onClick={() => {
                                                onProcess(tmp);
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            {tmp.name}
                                        </Button>
                                    ))}
                                    {templates.length === 0 && (
                                        <p className="text-xs text-center py-2 text-muted-foreground">No templates configured</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <Button variant="outline" onClick={handleCopy}>
                            {copied ? <span className="text-green-500">Copied</span> : <><Copy className="mr-2 h-4 w-4" /> Copy</>}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleDownload('pdf')}>
                            PDF
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDownload('txt')}>
                            TXT
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDownload('md')}>
                            MD
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

