import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { ProcessTemplate } from '../types';
import { PROCESSING_TEMPLATES, TemplateCategory } from '../data/templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, X, FileText, Download, Copy, Play, ChevronRight, ChevronDown, Loader2, Send, Cpu, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";

// --- Markdown -> jsPDF renderer -----------------------------------------
// Direct text rendering (no html2canvas) so output is reliable on iPad
// Safari and produces a smaller vector PDF. Supports: # / ## / ### headings,
// **bold** / *italic* inline runs, "- "/"* " bullets, "1. " ordered lists,
// blank lines as paragraph separators.

type Run = { text: string; bold: boolean; italic: boolean };

const tokenizeInline = (text: string): Run[] => {
    const runs: Run[] = [];
    const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*|([^*]+|\*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m[1] !== undefined) runs.push({ text: m[1], bold: true, italic: false });
        else if (m[2] !== undefined) runs.push({ text: m[2], bold: false, italic: true });
        else if (m[3] !== undefined) runs.push({ text: m[3], bold: false, italic: false });
    }
    return runs.length ? runs : [{ text, bold: false, italic: false }];
};

const renderMarkdownToPdf = (fileName: string, content: string): jsPDF => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxW = pageW - margin * 2;

    let y = margin;

    const ensureSpace = (needed: number) => {
        if (y + needed > pageH - margin) {
            doc.addPage();
            y = margin;
        }
    };

    const setFont = (size: number, bold: boolean, italic: boolean) => {
        const style = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal';
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
    };

    // Render a sequence of inline runs with word-wrap inside [x0, x0+width].
    const renderRuns = (runs: Run[], size: number, x0: number, width: number, lineGap: number) => {
        let x = x0;
        let lineStarted = false;
        const newLine = () => {
            y += lineGap;
            x = x0;
            lineStarted = false;
            ensureSpace(lineGap);
        };
        ensureSpace(lineGap);
        for (const run of runs) {
            setFont(size, run.bold, run.italic);
            // Split into words while preserving spaces.
            const parts = run.text.split(/(\s+)/);
            for (const part of parts) {
                if (!part) continue;
                const isSpace = /^\s+$/.test(part);
                const w = doc.getTextWidth(part);
                if (!isSpace && lineStarted && x + w > x0 + width) {
                    newLine();
                    setFont(size, run.bold, run.italic);
                }
                if (isSpace && !lineStarted) continue; // skip leading spaces on a wrapped line
                doc.text(part, x, y);
                x += w;
                lineStarted = true;
            }
        }
        y += lineGap; // end of block line
    };

    // Title
    setFont(16, true, false);
    const titleLines = doc.splitTextToSize(fileName, maxW);
    titleLines.forEach((line: string) => {
        ensureSpace(7);
        doc.text(line, margin, y);
        y += 7;
    });
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Body, line by line
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    let prevBlank = false;
    for (let raw of lines) {
        const line = raw.replace(/\t/g, '    ');
        if (line.trim() === '') {
            if (!prevBlank) y += 3; // paragraph spacing
            prevBlank = true;
            continue;
        }
        prevBlank = false;

        // Headings
        let m = /^(#{1,3})\s+(.*)$/.exec(line);
        if (m) {
            const level = m[1].length;
            const size = level === 1 ? 14 : level === 2 ? 12 : 11;
            const lineGap = level === 1 ? 7 : level === 2 ? 6.5 : 6;
            y += 1;
            renderRuns([{ text: m[2], bold: true, italic: false }], size, margin, maxW, lineGap);
            continue;
        }

        // Bulleted list
        m = /^(\s*)[-*]\s+(.*)$/.exec(line);
        if (m) {
            const indent = Math.min(m[1].length, 8);
            const x0 = margin + 4 + indent;
            setFont(11, false, false);
            ensureSpace(5.5);
            doc.text('•', margin + indent, y);
            renderRuns(tokenizeInline(m[2]), 11, x0, maxW - (x0 - margin), 5.5);
            continue;
        }

        // Numbered list
        m = /^(\s*)(\d+)\.\s+(.*)$/.exec(line);
        if (m) {
            const indent = Math.min(m[1].length, 8);
            const marker = `${m[2]}.`;
            setFont(11, false, false);
            const markerW = doc.getTextWidth(marker + ' ');
            const x0 = margin + indent + markerW;
            ensureSpace(5.5);
            doc.text(marker, margin + indent, y);
            renderRuns(tokenizeInline(m[3]), 11, x0, maxW - (x0 - margin), 5.5);
            continue;
        }

        // Plain paragraph
        renderRuns(tokenizeInline(line), 11, margin, maxW, 5.5);
    }

    return doc;
};

interface TranscriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    content: string;
    templates: ProcessTemplate[];
    onProcess?: (template: ProcessTemplate, keepOriginal: boolean) => void;
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
    const [processingStep, setProcessingStep] = useState(0);
    const [keepOriginal, setKeepOriginal] = useState(true);

    const pdfContentRef = useRef<HTMLDivElement>(null);

    // Group Standard Templates by Category
    const categories: TemplateCategory[] = useMemo(() => ['Generales', 'Gestión y Negocios', 'Contenido y Comunicación', 'Análisis y Estudio'], []);

    // Animation cycle for processing
    useEffect(() => {
        if (!isProcessing) {
            setProcessingStep(0);
            return;
        }

        const interval = setInterval(() => {
            setProcessingStep(prev => (prev + 1) % 4);
        }, 2500);

        return () => clearInterval(interval);
    }, [isProcessing]);

    const processingStates = [
        { text: t.statusPreparing || "Preparing...", icon: Loader2, color: "text-blue-500" },
        { text: t.statusTransmitting || "Transmitting...", icon: Send, color: "text-yellow-500" },
        { text: t.statusProcessing || "Processing...", icon: Cpu, color: "text-purple-500" },
        { text: t.statusReceiving || "Receiving...", icon: Radio, color: "text-green-500" }
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async (format: 'txt' | 'md' | 'pdf' = 'txt') => {
        if (format === 'pdf') {
            // Render markdown directly into jsPDF as styled vector text.
            // Avoids html2canvas, which produces blank pages on iPad Safari.
            const baseName = fileName.split('.')[0];
            renderMarkdownToPdf(fileName, content).save(`${baseName}_transcript.pdf`);
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

    const CurrentStatusIcon = processingStates[processingStep].icon;

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
                            <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[200px] animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                                    <div className={cn("relative p-4 rounded-full bg-background border-2 shadow-lg transition-colors duration-500", processingStates[processingStep].color.replace('text-', 'border-'))}>
                                        <CurrentStatusIcon className={cn("h-8 w-8 transition-colors duration-500", processingStates[processingStep].color)} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-foreground font-medium text-lg animate-pulse transition-all duration-500 min-w-[200px] text-center">
                                        {processingStates[processingStep].text}
                                    </p>
                                    <div className="flex gap-1.5 pt-2">
                                        {[0, 1, 2, 3].map((step) => (
                                            <div
                                                key={step}
                                                className={cn(
                                                    "h-1.5 rounded-full transition-all duration-500",
                                                    step === processingStep ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
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
                <div className="border-t p-4 bg-background overflow-x-auto">
                    <div className="flex items-center justify-center gap-3">
                        {onProcess && (
                            <>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4" onClick={toggleMenu} disabled={isProcessing}>
                                    <Play className="mr-2 h-4 w-4" />
                                    {t.process}
                                </Button>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch
                                        id="keep-original"
                                        checked={keepOriginal}
                                        onCheckedChange={setKeepOriginal}
                                        disabled={isProcessing}
                                    />
                                    <Label htmlFor="keep-original" className="text-xs cursor-pointer whitespace-nowrap">
                                        {t.keepOriginal || 'Keep Original'}
                                    </Label>
                                </div>
                            </>
                        )}

                        {isMenuOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMenuOpen(false)}>
                                <div
                                    className="bg-popover w-full max-w-sm max-h-[80vh] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 flex flex-col"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Menu Header */}
                                    <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                                        <h4 className="font-semibold text-sm">
                                            {menuView === 'main' && (t.templates || 'Select Template')}
                                            {menuView === 'custom' && t.customTemplates}
                                            {menuView === 'standard' && t.standardTemplates}
                                        </h4>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsMenuOpen(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Menu Content - Scrollable */}
                                    <div className="p-2 overflow-y-auto">
                                        {menuView === 'main' && (
                                            <div className="space-y-1 p-2">
                                                <Button variant="ghost" className="w-full justify-between font-medium h-12 text-base px-4 bg-card border shadow-sm mb-2" onClick={() => setMenuView('custom')}>
                                                    <span>{t.customTemplates}</span>
                                                    <ChevronRight className="h-5 w-5 opacity-50" />
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-between font-medium h-12 text-base px-4 bg-card border shadow-sm" onClick={() => setMenuView('standard')}>
                                                    <span>{t.standardTemplates}</span>
                                                    <ChevronRight className="h-5 w-5 opacity-50" />
                                                </Button>
                                            </div>
                                        )}

                                        {menuView === 'custom' && (
                                            <div className="space-y-1">
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mb-2 h-8 px-2" onClick={() => setMenuView('main')}>
                                                    &larr; Back
                                                </Button>

                                                {templates.length === 0 ? (
                                                    <div className="text-center py-8 text-muted-foreground text-sm italic">
                                                        No custom templates found.
                                                    </div>
                                                ) : (
                                                    templates.map(tmp => (
                                                        <Button
                                                            key={tmp.id}
                                                            variant="ghost"
                                                            className="w-full justify-start text-sm h-auto py-3 px-4 border-b last:border-0"
                                                            onClick={() => { onProcess(tmp, keepOriginal); setIsMenuOpen(false); }}
                                                        >
                                                            {tmp.name}
                                                        </Button>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {menuView === 'standard' && (
                                            <div className="space-y-1">
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mb-2 h-8 px-2" onClick={() => setMenuView('main')}>
                                                    &larr; Back
                                                </Button>

                                                {categories.map(category => (
                                                    <div key={category} className="border rounded-lg mb-2 overflow-hidden">
                                                        <div
                                                            className="flex items-center justify-between p-3 cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
                                                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                                        >
                                                            <span className="text-sm font-medium">{category}</span>
                                                            {selectedCategory === category ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </div>

                                                        {selectedCategory === category && (
                                                            <div className="bg-background divide-y">
                                                                {PROCESSING_TEMPLATES.filter(t => t.category === category).map(t => (
                                                                    <Button
                                                                        key={t.id}
                                                                        variant="ghost"
                                                                        className="w-full justify-start text-sm h-auto py-3 px-4 whitespace-normal text-left hover:bg-muted/10 rounded-none"
                                                                        onClick={() => { onProcess(t, keepOriginal); setIsMenuOpen(false); }}
                                                                    >
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="font-medium text-primary">{t.name}</span>
                                                                            <span className="text-xs text-muted-foreground font-normal leading-relaxed">{t.objective}</span>
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
                            </div>
                        )}

                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 p-0 flex-shrink-0" onClick={handleCopy} title="Copy to Clipboard">
                            {copied ? <span className="text-white font-bold">✓</span> : <Copy className="h-4 w-4" />}
                        </Button>

                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 flex-shrink-0" onClick={() => handleDownload('pdf')}>
                            PDF
                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 flex-shrink-0" onClick={() => handleDownload('txt')}>
                            TXT
                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 flex-shrink-0" onClick={() => handleDownload('md')}>
                            MD
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};

