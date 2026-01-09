import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { ProcessTemplate } from '../types';
import { PROCESSING_TEMPLATES, TemplateCategory } from '../data/templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZoomIn, ZoomOut, X, FileText, Download, Copy, Play, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";

interface TranscriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    content: string;
    templates: ProcessTemplate[];
    onProcess?: (template: ProcessTemplate) => void;
    isProcessing: boolean;
    t: any;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
    isOpen, onClose, fileName, content, templates, onProcess, isProcessing, t
}) => {
    const [fontSize, setFontSize] = useState(16);
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuView, setMenuView] = useState<'main' | 'custom' | 'standard'>('main');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const pdfContentRef = useRef<HTMLDivElement>(null);

    // Group Standard Templates by Category
    const categories: TemplateCategory[] = useMemo(() => ['Generales', 'Gestión y Negocios', 'Contenido y Comunicación', 'Análisis y Estudio'], []);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md' | 'pdf' = 'txt') => {
        if (format === 'pdf') {
            const doc = new jsPDF();

            // Set font properties
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            // Split text to fit page width (A4 width is ~210mm, leaving margins)
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const maxLineWidth = pageWidth - (margin * 2);
            const lineHeight = 6;

            const splitText = doc.splitTextToSize(content, maxLineWidth);

            let cursorY = margin;

            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(fileName, margin, cursorY);
            cursorY += 10;

            // Content
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            splitText.forEach((line: string) => {
                if (cursorY > pageHeight - margin) {
                    doc.addPage();
                    cursorY = margin;
                }
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });

            doc.save(`${fileName.split('.')[0]}_transcript.pdf`);
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

    // Reset menu state when opening/closing
    const toggleMenu = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
            setMenuView('main');
            setSelectedCategory(null);
        } else {
            setIsMenuOpen(true);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] h-[90vh] max-w-4xl flex flex-col p-0 gap-0">
                {/* Header: Row 1 Name + Close, Row 2 Controls */}
                <div className="flex flex-col gap-2 border-b px-6 py-3 bg-muted/30">
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="truncate font-semibold text-base leading-tight">{fileName}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFontSize(f => Math.max(10, f - 2))} title="Decrease text size">
                            <ZoomOut className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium w-8 text-center">{fontSize}px</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFontSize(f => Math.min(48, f + 2))} title="Increase text size">
                            <ZoomIn className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-muted/10">
                    <ScrollArea className="h-full w-full">
                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[200px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground animate-pulse text-sm">Processing with AI...</p>
                            </div>
                        ) : (
                            <div
                                ref={pdfContentRef}
                                className="markdown-content-viewer p-8 rounded-lg border bg-background text-foreground shadow-sm"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Footer / Actions */}
                <div className="border-t p-3 flex items-center justify-between bg-background gap-2 overflow-x-auto">
                    <div className="flex gap-2 relative">
                        <div className="relative">
                            {onProcess && (
                                <Button variant="outline" size="sm" className="h-8 px-2" onClick={toggleMenu} disabled={isProcessing}>
                                    <Play className="mr-1.5 h-3.5 w-3.5" />
                                    {t.process}
                                </Button>
                            )}

                            {isMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border bg-popover text-popover-foreground shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                    {/* ... Menu content ... */}
                                    <div className="p-3 border-b flex justify-between items-center bg-muted/20 rounded-t-lg">
                                        <h4 className="font-semibold text-sm">
                                            {menuView === 'main' && (t.templates || 'Select Template')}
                                            {menuView === 'custom' && 'Custom Templates'}
                                            {menuView === 'standard' && 'Standard Templates'}
                                        </h4>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsMenuOpen(false)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                        {menuView === 'main' && (
                                            <div className="space-y-1">
                                                <Button variant="ghost" className="w-full justify-between font-normal h-8" onClick={() => setMenuView('custom')}>
                                                    <span>Custom Templates</span>
                                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-between font-normal h-8" onClick={() => setMenuView('standard')}>
                                                    <span>Standard Templates</span>
                                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </div>
                                        )}

                                        {menuView === 'custom' && (
                                            <div className="space-y-1">
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mb-1 h-6" onClick={() => setMenuView('main')}>
                                                    &larr; Back
                                                </Button>
                                                {templates.map(tmp => (
                                                    <Button
                                                        key={tmp.id}
                                                        variant="ghost"
                                                        className="w-full justify-start text-sm h-auto py-1.5"
                                                        onClick={() => { onProcess(tmp); setIsMenuOpen(false); }}
                                                    >
                                                        {tmp.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {menuView === 'standard' && (
                                            <div className="space-y-1">
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mb-1 h-6" onClick={() => setMenuView('main')}>
                                                    &larr; Back
                                                </Button>

                                                {categories.map(category => (
                                                    <div key={category} className="border-b last:border-0 border-border/50">
                                                        <div
                                                            className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 rounded-sm"
                                                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                                        >
                                                            <span className="text-sm font-medium">{category}</span>
                                                            {selectedCategory === category ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                        </div>

                                                        {selectedCategory === category && (
                                                            <div className="pl-2 pr-1 py-1 space-y-1 bg-muted/10">
                                                                {PROCESSING_TEMPLATES.filter(t => t.category === category).map(t => (
                                                                    <Button
                                                                        key={t.id}
                                                                        variant="ghost"
                                                                        className="w-full justify-start text-xs h-auto py-2 whitespace-normal text-left"
                                                                        onClick={() => { onProcess(t); setIsMenuOpen(false); }}
                                                                    >
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-medium">{t.name}</span>
                                                                            <span className="text-[10px] text-muted-foreground opacity-80">{t.objective}</span>
                                                                        </div>
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" size="sm" className="h-8 w-8 px-0" onClick={handleCopy} title="Copy to Clipboard">
                            {copied ? <span className="text-green-500 font-bold">✓</span> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button variant="secondary" size="sm" className="h-8 px-2" onClick={() => handleDownload('pdf')}>
                            PDF
                        </Button>
                        <Button variant="secondary" size="sm" className="h-8 px-2" onClick={() => handleDownload('txt')}>
                            TXT
                        </Button>
                        <Button variant="secondary" size="sm" className="h-8 px-2" onClick={() => handleDownload('md')}>
                            MD
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

