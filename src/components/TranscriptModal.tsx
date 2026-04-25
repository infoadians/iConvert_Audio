import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore - html2pdf.js types are minimal
import html2pdf from 'html2pdf.js';
import { ProcessTemplate } from '../types';
import { PROCESSING_TEMPLATES, TemplateCategory } from '../data/templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZoomIn, ZoomOut, X, FileText, Download, Copy, Play, ChevronRight, ChevronDown, Loader2, Send, Cpu, Radio } from 'lucide-react';
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
    const [processingStep, setProcessingStep] = useState(0);

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

    const handleDownload = (format: 'txt' | 'md' | 'pdf' = 'txt') => {
        if (format === 'pdf') {
            // Render the rendered Markdown DOM to PDF so headings/bold/lists
            // appear formatted instead of raw "##" / "**" syntax.
            const baseName = fileName.split('.')[0];
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'padding:24px;font-family:Inter,sans-serif;color:#0f172a;background:#ffffff;line-height:1.5;font-size:12pt;width:180mm;';
            const title = document.createElement('h1');
            title.textContent = fileName;
            title.style.cssText = 'font-size:18pt;font-weight:700;margin:0 0 16px 0;border-bottom:1px solid #cbd5e1;padding-bottom:8px;';
            wrapper.appendChild(title);

            const body = document.createElement('div');
            if (pdfContentRef.current) {
                body.innerHTML = pdfContentRef.current.innerHTML;
            } else {
                body.textContent = content;
            }
            // Inline minimal markdown styling so html2canvas picks it up.
            const style = document.createElement('style');
            style.textContent = `
                .pdf-md h1 { font-size: 16pt; font-weight: 700; margin: 14px 0 8px; }
                .pdf-md h2 { font-size: 14pt; font-weight: 700; margin: 12px 0 6px; }
                .pdf-md h3 { font-size: 12pt; font-weight: 700; margin: 10px 0 4px; }
                .pdf-md p  { margin: 0 0 8px 0; }
                .pdf-md strong { font-weight: 700; }
                .pdf-md em { font-style: italic; }
                .pdf-md ul, .pdf-md ol { margin: 0 0 8px 20px; padding: 0; }
                .pdf-md li { margin: 0 0 4px 0; }
                .pdf-md code { font-family: monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
                .pdf-md blockquote { margin: 0 0 8px 0; padding: 4px 12px; border-left: 3px solid #cbd5e1; color: #475569; }
            `;
            wrapper.appendChild(style);
            body.className = 'pdf-md';
            wrapper.appendChild(body);

            // Offscreen so it renders at the desired width without affecting the modal.
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-10000px';
            wrapper.style.top = '0';
            document.body.appendChild(wrapper);

            const opt = {
                margin: [10, 15, 10, 15] as [number, number, number, number],
                filename: `${baseName}_transcript.pdf`,
                image: { type: 'jpeg' as const, quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            html2pdf().set(opt).from(wrapper).save().finally(() => {
                document.body.removeChild(wrapper);
            });
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
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4" onClick={toggleMenu} disabled={isProcessing}>
                                <Play className="mr-2 h-4 w-4" />
                                {t.process}
                            </Button>
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
                                                            onClick={() => { onProcess(tmp); setIsMenuOpen(false); }}
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
                                                                        onClick={() => { onProcess(t); setIsMenuOpen(false); }}
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

