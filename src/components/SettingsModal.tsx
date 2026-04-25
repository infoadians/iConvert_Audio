import React, { useState, useEffect } from 'react';
import { Language } from '../i18n';
import { ProcessTemplate } from '../types';
import { PROCESSING_TEMPLATES, TemplateCategory } from '../data/templates';
import { ColorPicker } from './ColorPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, Minus, Save, ChevronRight, ChevronDown, X, Languages, RotateCcw, Eye, EyeOff, Sparkles, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";
import { APP_VERSION } from '../version';
import { DEFAULT_TRANSCRIPTION_PROMPT, AVAILABLE_MODELS } from '../data/prompts';

type ApiKeyTier = 'free' | 'paid';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    setLang: (lang: Language) => void;
    isDark: boolean;
    setIsDark: (isDark: boolean) => void;
    primaryHue: number;
    setPrimaryHue: (hue: number) => void;
    apiKeyFree: string;
    apiKeyPaid: string;
    activeApiKey: ApiKeyTier;
    onSaveKey: (tier: ApiKeyTier, key: string) => void;
    onSetActiveApiKey: (tier: ApiKeyTier) => void;
    selectedModel: string;
    onSetModel: (model: string) => void;
    templates: ProcessTemplate[];
    onSaveTemplates: (templates: ProcessTemplate[]) => void;
    fontScale: number;
    onSaveFontScale: (scale: number) => void;
    transcriptionPrompt: string;
    onSaveTranscriptionPrompt: (prompt: string) => void;
    onGeneratePrompt: (idea: string) => Promise<string>;
    t: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, lang, setLang, isDark, setIsDark,
    primaryHue, setPrimaryHue,
    apiKeyFree, apiKeyPaid, activeApiKey, onSaveKey, onSetActiveApiKey,
    selectedModel, onSetModel,
    templates, onSaveTemplates, fontScale, onSaveFontScale,
    transcriptionPrompt, onSaveTranscriptionPrompt, onGeneratePrompt, t
}) => {
    const [localKeyFree, setLocalKeyFree] = useState(apiKeyFree);
    const [localKeyPaid, setLocalKeyPaid] = useState(apiKeyPaid);

    const apiKey = activeApiKey === 'free' ? apiKeyFree : apiKeyPaid;
    const isModelCustom = !AVAILABLE_MODELS.some(m => m.id === selectedModel);
    const [customModelInput, setCustomModelInput] = useState(isModelCustom ? selectedModel : '');

    // Custom Template State
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ProcessTemplate | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrompt, setNewPrompt] = useState('');

    // Standard Template State
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [revealedPrompts, setRevealedPrompts] = useState<string[]>([]);

    // Section Collapse State
    const [isCustomExpanded, setIsCustomExpanded] = useState(false);
    const [isStandardExpanded, setIsStandardExpanded] = useState(false);
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [isBuilderExpanded, setIsBuilderExpanded] = useState(false);

    // Transcription prompt local edit buffer
    const [localPrompt, setLocalPrompt] = useState(transcriptionPrompt);

    // Prompt Builder state
    const [builderIdea, setBuilderIdea] = useState('');
    const [builderOutput, setBuilderOutput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [builderError, setBuilderError] = useState<string | null>(null);
    const [builderCopied, setBuilderCopied] = useState(false);

    const handleGenerate = async () => {
        if (!apiKey) {
            setBuilderError(t.apiKeyMissing || 'API Key required');
            return;
        }
        if (!builderIdea.trim()) return;
        setBuilderError(null);
        setIsGenerating(true);
        try {
            const result = await onGeneratePrompt(builderIdea);
            setBuilderOutput(result);
        } catch (err: any) {
            setBuilderError(err?.message || 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyOutput = async () => {
        if (!builderOutput) return;
        try {
            await navigator.clipboard.writeText(builderOutput);
            setBuilderCopied(true);
            setTimeout(() => setBuilderCopied(false), 2000);
        } catch {
            /* noop */
        }
    };


    useEffect(() => {
        setLocalKeyFree(apiKeyFree);
    }, [apiKeyFree]);

    useEffect(() => {
        setLocalKeyPaid(apiKeyPaid);
    }, [apiKeyPaid]);

    useEffect(() => {
        setLocalPrompt(transcriptionPrompt);
    }, [transcriptionPrompt]);

    useEffect(() => {
        if (!AVAILABLE_MODELS.some(m => m.id === selectedModel)) {
            setCustomModelInput(selectedModel);
        }
    }, [selectedModel]);

    const promptIsDirty = localPrompt !== transcriptionPrompt;
    const promptIsCustom = transcriptionPrompt !== DEFAULT_TRANSCRIPTION_PROMPT;

    const freeIsUnchanged = localKeyFree === apiKeyFree;
    const paidIsUnchanged = localKeyPaid === apiKeyPaid;

    const handleAddTemplate = () => {
        if (!newName.trim() || !newPrompt.trim()) return;
        const newTemplate: ProcessTemplate = {
            id: crypto.randomUUID(),
            name: newName,
            prompt: newPrompt
        };
        onSaveTemplates([...templates, newTemplate]);
        setNewName('');
        setNewPrompt('');
        setIsAddTemplateOpen(false);
    };

    const handleEditTemplate = (template: ProcessTemplate) => {
        setEditingTemplate(template);
        setNewName(template.name);
        setNewPrompt(template.prompt);
        setIsAddTemplateOpen(true);
    };

    const handleUpdateTemplate = () => {
        if (!editingTemplate || !newName.trim() || !newPrompt.trim()) return;
        const updatedTemplates = templates.map(t =>
            t.id === editingTemplate.id ? { ...t, name: newName, prompt: newPrompt } : t
        );
        onSaveTemplates(updatedTemplates);
        setEditingTemplate(null);
        setNewName('');
        setNewPrompt('');
        setIsAddTemplateOpen(false);
    };

    const handleDeleteTemplate = (id: string) => {
        onSaveTemplates(templates.filter(t => t.id !== id));
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    // Group Standard Templates by Category
    const categories: TemplateCategory[] = ['Generales', 'Gestión y Negocios', 'Contenido y Comunicación', 'Análisis y Estudio'];


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="fixed inset-0 z-50 w-screen h-screen max-w-none m-0 rounded-none flex flex-col gap-0 p-0 bg-background !translate-x-0 !translate-y-0 !top-0 !left-0 [&>button]:hidden">
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-baseline gap-2">
                            <span>{t.settings}</span>
                            <span className="text-xs font-mono font-normal text-muted-foreground">(v{APP_VERSION})</span>
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid gap-3 p-4 overflow-y-auto h-full content-start max-w-3xl mx-auto w-full">
                    {/* Appearance Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.appearance}</h4>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between h-8">
                            <Label htmlFor="dark-mode">{t.darkMode}</Label>
                            <Switch
                                id="dark-mode"
                                checked={isDark}
                                onCheckedChange={setIsDark}
                            />
                        </div>

                        {/* Theme Color */}
                        <div className="flex items-center justify-between h-8">
                            <Label>{t.themeColor}</Label>
                            <ColorPicker primaryHue={primaryHue} setPrimaryHue={setPrimaryHue} t={t} />
                        </div>

                        <div className="flex items-center justify-between h-8">
                            <Label>{t.language}</Label>
                            <Button
                                variant="outline"
                                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                                className="w-[140px] h-8 justify-between text-xs"
                            >
                                <span className="flex items-center gap-2">
                                    <Languages className="h-3 w-3" />
                                    {lang === 'en' ? 'English' : 'Español'}
                                </span>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between h-6">
                                <Label>UI Scale</Label>
                                <span className="text-sm text-muted-foreground">{Math.round(fontScale * 100)}%</span>
                            </div>
                            <Slider
                                min={0.5}
                                max={1.5}
                                step={0.1}
                                value={[fontScale]}
                                onValueChange={(val) => onSaveFontScale(val[0])}
                                className="py-1"
                            />
                        </div>
                    </div>

                    <div className="border-t my-0.5" />

                    {/* AI Section — Free / Paid keys with active toggle */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.apiKeyTitle}</h4>

                        {/* Active key toggle */}
                        <div className="flex items-center justify-between rounded-md border bg-muted/20 px-2 py-1.5">
                            <Label className="text-xs">{t.activeKey}</Label>
                            <div className="flex items-center gap-1 rounded-md bg-background border p-0.5">
                                <button
                                    type="button"
                                    onClick={() => onSetActiveApiKey('free')}
                                    className={cn(
                                        "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded",
                                        activeApiKey === 'free'
                                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t.freeKey}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSetActiveApiKey('paid')}
                                    className={cn(
                                        "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded",
                                        activeApiKey === 'paid'
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t.paidKey}
                                </button>
                            </div>
                        </div>

                        {/* Free key */}
                        <div className="space-y-1">
                            <Label className="text-xs">{t.apiKeyFreeLabel}</Label>
                            <div className="flex gap-2 items-end">
                                <Input
                                    type="password"
                                    value={localKeyFree}
                                    onChange={(e) => setLocalKeyFree(e.target.value)}
                                    placeholder={t.apiKeyPlaceholder}
                                    className="h-8 text-xs"
                                />
                                <Button
                                    onClick={() => onSaveKey('free', localKeyFree)}
                                    size="sm"
                                    disabled={freeIsUnchanged}
                                    className={cn("h-8 text-xs", freeIsUnchanged ? "opacity-50" : "")}
                                >
                                    {freeIsUnchanged ? 'Saved' : t.saveKey}
                                </Button>
                            </div>
                        </div>

                        {/* Paid key */}
                        <div className="space-y-1">
                            <Label className="text-xs">{t.apiKeyPaidLabel}</Label>
                            <div className="flex gap-2 items-end">
                                <Input
                                    type="password"
                                    value={localKeyPaid}
                                    onChange={(e) => setLocalKeyPaid(e.target.value)}
                                    placeholder={t.apiKeyPlaceholder}
                                    className="h-8 text-xs"
                                />
                                <Button
                                    onClick={() => onSaveKey('paid', localKeyPaid)}
                                    size="sm"
                                    disabled={paidIsUnchanged}
                                    className={cn("h-8 text-xs", paidIsUnchanged ? "opacity-50" : "")}
                                >
                                    {paidIsUnchanged ? 'Saved' : t.saveKey}
                                </Button>
                            </div>
                        </div>

                        {/* Model selector */}
                        <div className="space-y-1 pt-1">
                            <Label className="text-xs">{t.aiModel}</Label>
                            <p className="text-[11px] text-muted-foreground">{t.aiModelDesc}</p>
                            <Select
                                value={isModelCustom ? '__custom__' : selectedModel}
                                onValueChange={(val) => {
                                    if (val === '__custom__') {
                                        // Stay on whatever custom value the user has typed (or empty).
                                        if (customModelInput.trim()) onSetModel(customModelInput.trim());
                                    } else {
                                        onSetModel(val);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_MODELS.map(m => (
                                        <SelectItem key={m.id} value={m.id} className="text-xs">
                                            <span className="flex items-center gap-2">
                                                <span>{m.label}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{m.id}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="__custom__" className="text-xs">
                                        {t.customModel}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {isModelCustom && (
                                <div className="flex gap-2 items-end pt-1">
                                    <Input
                                        value={customModelInput}
                                        onChange={(e) => setCustomModelInput(e.target.value)}
                                        placeholder={t.customModelPlaceholder}
                                        className="h-8 text-xs font-mono"
                                    />
                                    <Button
                                        onClick={() => onSetModel(customModelInput.trim())}
                                        size="sm"
                                        disabled={!customModelInput.trim() || customModelInput.trim() === selectedModel}
                                        className="h-8 text-xs"
                                    >
                                        {t.save}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t my-0.5" />

                    {/* TRANSCRIPTION PROMPT */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/30 rounded flex-1 min-w-0" onClick={() => setIsPromptExpanded(!isPromptExpanded)}>
                                {isPromptExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <h4 className="text-sm font-bold leading-none text-foreground tracking-wide truncate">{t.transcriptionPrompt}</h4>
                                {promptIsCustom && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                        Custom
                                    </span>
                                )}
                            </div>
                        </div>
                        {isPromptExpanded && (
                            <div className="space-y-2 pl-2">
                                <p className="text-xs text-muted-foreground">{t.transcriptionPromptDesc}</p>
                                <textarea
                                    value={localPrompt}
                                    onChange={(e) => setLocalPrompt(e.target.value)}
                                    spellCheck={false}
                                    className="flex min-h-[180px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => onSaveTranscriptionPrompt(localPrompt)}
                                        disabled={!promptIsDirty}
                                        className={cn("h-8 text-xs", !promptIsDirty ? "opacity-50" : "")}
                                    >
                                        <Save className="mr-2 h-3 w-3" />
                                        {promptIsDirty ? t.save : 'Saved'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setLocalPrompt(DEFAULT_TRANSCRIPTION_PROMPT);
                                            onSaveTranscriptionPrompt(DEFAULT_TRANSCRIPTION_PROMPT);
                                        }}
                                        disabled={!promptIsCustom && !promptIsDirty}
                                        className="h-8 text-xs"
                                    >
                                        <RotateCcw className="mr-2 h-3 w-3" />
                                        {t.restoreDefault}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t my-0.5" />

                    {/* PROMPT BUILDER */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/30 rounded" onClick={() => setIsBuilderExpanded(!isBuilderExpanded)}>
                            {isBuilderExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <h4 className="text-sm font-bold leading-none text-foreground tracking-wide">{t.promptBuilder}</h4>
                        </div>
                        {isBuilderExpanded && (
                            <div className="space-y-2 pl-2">
                                <p className="text-xs text-muted-foreground">{t.promptBuilderDesc}</p>
                                {!apiKey && (
                                    <p className="text-xs text-destructive">{t.apiKeyMissing}</p>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-xs">{t.ideaLabel}</Label>
                                    <textarea
                                        value={builderIdea}
                                        onChange={(e) => setBuilderIdea(e.target.value)}
                                        placeholder={t.ideaPlaceholder}
                                        spellCheck={false}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={!apiKey || !builderIdea.trim() || isGenerating}
                                    className={cn("h-8 text-xs", (!apiKey || !builderIdea.trim()) ? "opacity-50" : "")}
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="mr-2 h-3 w-3 animate-spin" />{t.generating}</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-3 w-3" />{t.generate}</>
                                    )}
                                </Button>
                                {builderError && (
                                    <p className="text-xs text-destructive">{builderError}</p>
                                )}
                                {(isGenerating || builderOutput) && (
                                    <div className="space-y-1 pt-1">
                                        <Label className="text-xs">{t.suggestedPrompt}</Label>
                                        <textarea
                                            value={builderOutput}
                                            onChange={(e) => setBuilderOutput(e.target.value)}
                                            spellCheck={false}
                                            placeholder={isGenerating ? t.generating : ''}
                                            disabled={isGenerating}
                                            className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCopyOutput}
                                                disabled={!builderOutput || isGenerating}
                                                className="h-8 text-xs"
                                            >
                                                <Copy className="mr-2 h-3 w-3" />
                                                {builderCopied ? t.copied : t.copyPrompt}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t my-0.5" />

                    {/* TEMPLATES SECTION */}
                    <div className="space-y-3">

                        {/* STANDARD TEMPLATES (Moved Top) */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/30 rounded" onClick={() => setIsStandardExpanded(!isStandardExpanded)}>
                                {isStandardExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <h4 className="text-sm font-bold leading-none text-foreground tracking-wide">{t.standardTemplates}</h4>
                            </div>

                            {isStandardExpanded && (
                                <div className="space-y-1 pl-2">
                                    {categories.map(category => (
                                        <Card key={category} className="overflow-hidden border-none shadow-none bg-muted/20">
                                            <div
                                                className="flex items-center justify-between p-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
                                                onClick={() => toggleCategory(category)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {expandedCategories.includes(category) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                    <span className="text-sm font-medium">{category}</span>
                                                </div>
                                            </div>

                                            {expandedCategories.includes(category) && (
                                                <div className="px-2 pb-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                                    {PROCESSING_TEMPLATES.filter(tpl => tpl.category === category).map(tpl => {
                                                        const isRevealed = revealedPrompts.includes(tpl.id);
                                                        return (
                                                            <div key={tpl.id} className="text-xs p-1.5 rounded-md bg-background border">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-medium text-primary">{tpl.name}</div>
                                                                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">({tpl.objective})</div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 flex-shrink-0"
                                                                        onClick={() => setRevealedPrompts(prev => isRevealed ? prev.filter(id => id !== tpl.id) : [...prev, tpl.id])}
                                                                        title={isRevealed ? t.hidePrompt : t.viewPrompt}
                                                                    >
                                                                        {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                    </Button>
                                                                </div>
                                                                {isRevealed && (
                                                                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/40 p-2 text-[10px] font-mono leading-relaxed">
                                                                        {tpl.prompt}
                                                                    </pre>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CUSTOM TEMPLATES (Moved Bottom) */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/30 rounded" onClick={() => setIsCustomExpanded(!isCustomExpanded)}>
                                {isCustomExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <h4 className="text-sm font-bold leading-none text-foreground tracking-wide">{t.customTemplates}</h4>
                            </div>

                            {isCustomExpanded && (
                                <>
                                    <div className="pl-6 py-1">
                                        <Dialog open={isAddTemplateOpen} onOpenChange={(open) => {
                                            if (!open) { setEditingTemplate(null); setNewName(''); setNewPrompt(''); }
                                            setIsAddTemplateOpen(open);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-start">
                                                    <Plus className="h-3 w-3 mr-2" />
                                                    {t.addNew}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>{editingTemplate ? t.editTemplate : t.addTemplate}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name">{t.templateName}</Label>
                                                        <Input
                                                            id="name"
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            placeholder="My Custom Template"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="prompt">{t.templatePrompt}</Label>
                                                        <textarea
                                                            id="prompt"
                                                            value={newPrompt}
                                                            onChange={(e) => setNewPrompt(e.target.value)}
                                                            placeholder="Instructions for the AI..."
                                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <Button onClick={editingTemplate ? handleUpdateTemplate : handleAddTemplate}>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        {editingTemplate ? t.save : t.addTemplate}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="space-y-1 pl-2">
                                        {templates.map(tmp => (
                                            <div key={tmp.id} className="group flex items-center justify-between p-1.5 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                                <span className="text-sm font-medium truncate flex-1">{tmp.name}</span>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditTemplate(tmp)}>
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteTemplate(tmp.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {templates.length === 0 && <p className="text-xs text-muted-foreground py-2 italic pl-2">No custom templates added.</p>}
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
