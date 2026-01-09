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
import { Trash2, Edit2, Plus, Minus, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    setLang: (lang: Language) => void;
    isDark: boolean;
    setIsDark: (isDark: boolean) => void;
    primaryHue: number;
    setPrimaryHue: (hue: number) => void;
    apiKey: string;
    onSaveKey: (key: string) => void;
    templates: ProcessTemplate[];
    onSaveTemplates: (templates: ProcessTemplate[]) => void;
    fontScale: number;
    onSaveFontScale: (scale: number) => void;
    t: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, lang, setLang, isDark, setIsDark,
    primaryHue, setPrimaryHue, apiKey, onSaveKey,
    templates, onSaveTemplates, fontScale, onSaveFontScale, t
}) => {
    const [localKey, setLocalKey] = useState(apiKey);

    // Custom Template State
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ProcessTemplate | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrompt, setNewPrompt] = useState('');

    // Standard Template State
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Section Collapse State
    const [isCustomExpanded, setIsCustomExpanded] = useState(false);
    const [isStandardExpanded, setIsStandardExpanded] = useState(false);


    useEffect(() => {
        setLocalKey(apiKey);
    }, [apiKey]);

    const handleSaveKey = () => {
        onSaveKey(localKey);
    };

    const isKeyUnchanged = localKey === apiKey;

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
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90dvh] overflow-hidden p-0 rounded-xl flex flex-col gap-0">
                <DialogHeader className="p-6 pb-2 sm:p-0">
                    <DialogTitle>{t.settings}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 p-6 sm:p-0 overflow-y-auto flex-1">
                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.appearance}</h4>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">{t.darkMode}</Label>
                            <Switch
                                id="dark-mode"
                                checked={isDark}
                                onCheckedChange={setIsDark}
                            />
                        </div>

                        {/* Theme Color */}
                        <div className="flex items-center justify-between">
                            <Label>{t.themeColor}</Label>
                            <ColorPicker primaryHue={primaryHue} setPrimaryHue={setPrimaryHue} t={t} />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.language}</Label>
                            <Select value={lang} onValueChange={(val: Language) => setLang(val)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>UI Scale</Label>
                                <span className="text-sm text-muted-foreground">{Math.round(fontScale * 100)}%</span>
                            </div>
                            <Slider
                                min={0.5}
                                max={1.5}
                                step={0.1}
                                value={[fontScale]}
                                onValueChange={(val) => onSaveFontScale(val[0])}
                            />
                        </div>
                    </div>

                    <div className="border-t my-1" />

                    {/* AI Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.apiKeyTitle}</h4>
                        <div className="flex gap-2 items-end">
                            <div className="grid w-full gap-1.5">
                                <Input
                                    type="password"
                                    value={localKey}
                                    onChange={(e) => setLocalKey(e.target.value)}
                                    placeholder={t.apiKeyPlaceholder}
                                    className="h-9"
                                />
                            </div>
                            <Button
                                onClick={handleSaveKey}
                                size="sm"
                                disabled={isKeyUnchanged}
                                className={cn("h-9", isKeyUnchanged ? "opacity-50" : "")}
                            >
                                {isKeyUnchanged ? 'Saved' : t.saveKey}
                            </Button>
                        </div>
                    </div>

                    <div className="border-t my-1" />

                    {/* TEMPLATES SECTION */}
                    <div className="space-y-6">

                        {/* CUSTOM TEMPLATES */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsCustomExpanded(!isCustomExpanded)}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0">
                                        {isCustomExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                    <h4 className="text-lg font-bold leading-none text-primary tracking-wide">CUSTOM TRANSCRIPTION TEMPLATES</h4>
                                </div>

                                {isCustomExpanded && (
                                    <Dialog open={isAddTemplateOpen} onOpenChange={(open) => {
                                        if (!open) { setEditingTemplate(null); setNewName(''); setNewPrompt(''); }
                                        setIsAddTemplateOpen(open);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => { setEditingTemplate(null); }}>
                                                Add New
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
                                )}
                            </div>

                            {isCustomExpanded && (
                                <div className="space-y-2 pl-8">
                                    {templates.map(tmp => (
                                        <div key={tmp.id} className="group flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                            <span className="text-sm font-medium">{tmp.name}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditTemplate(tmp)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteTemplate(tmp.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {templates.length === 0 && <p className="text-xs text-muted-foreground py-2 italic">No custom templates added.</p>}
                                </div>
                            )}
                        </div>

                        {/* STANDARD TEMPLATES */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsStandardExpanded(!isStandardExpanded)}>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0">
                                        {isStandardExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                    <h4 className="text-lg font-bold leading-none text-primary tracking-wide">STANDARD TRANSCRIPTION TEMPLATES</h4>
                                </div>
                            </div>

                            {isStandardExpanded && (
                                <div className="space-y-2 pl-8">
                                    {categories.map(category => (
                                        <Card key={category} className="overflow-hidden border-none shadow-none bg-muted/20">
                                            <div
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                                                onClick={() => toggleCategory(category)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {expandedCategories.includes(category) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    <span className="text-sm font-medium">{category}</span>
                                                </div>
                                            </div>

                                            {expandedCategories.includes(category) && (
                                                <div className="px-4 pb-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                                    {PROCESSING_TEMPLATES.filter(t => t.category === category).map(t => (
                                                        <div key={t.id} className="text-sm p-2 rounded-md bg-background border">
                                                            <div className="font-medium text-primary">{t.name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">({t.objective})</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
