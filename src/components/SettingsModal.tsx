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
import { Trash2, Edit2, Plus, Minus, Save, ChevronRight, ChevronDown, X, Languages } from 'lucide-react';
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
            <DialogContent className="fixed inset-0 z-50 w-screen h-screen max-w-none m-0 rounded-none flex flex-col gap-0 p-0 bg-background !translate-x-0 !translate-y-0 !top-0 !left-0 [&>button]:hidden">
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>{t.settings}</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid gap-3 p-4 overflow-y-auto flex-1 max-w-3xl mx-auto w-full">
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

                    {/* AI Section */}
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground mb-2">{t.apiKeyTitle}</h4>
                        <div className="flex gap-2 items-end">
                            <div className="grid w-full gap-1">
                                <Input
                                    type="password"
                                    value={localKey}
                                    onChange={(e) => setLocalKey(e.target.value)}
                                    placeholder={t.apiKeyPlaceholder}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <Button
                                onClick={handleSaveKey}
                                size="sm"
                                disabled={isKeyUnchanged}
                                className={cn("h-8 text-xs", isKeyUnchanged ? "opacity-50" : "")}
                            >
                                {isKeyUnchanged ? 'Saved' : t.saveKey}
                            </Button>
                        </div>
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
                                                    {PROCESSING_TEMPLATES.filter(t => t.category === category).map(t => (
                                                        <div key={t.id} className="text-xs p-1.5 rounded-md bg-background border">
                                                            <div className="font-medium text-primary">{t.name}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">({t.objective})</div>
                                                        </div>
                                                    ))}
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
