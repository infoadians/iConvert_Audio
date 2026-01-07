import React, { useState } from 'react';
import { Language } from '../i18n';
import { ProcessTemplate } from '../types';
import { ColorPicker } from './ColorPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// We need a Textarea component, let's assume standard HTML textarea for now if shadcn Textarea isn't installed, 
// but actually we can style it with Tailwind.

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
    const [keySaved, setKeySaved] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ProcessTemplate | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrompt, setNewPrompt] = useState('');

    const handleSaveKey = () => {
        onSaveKey(localKey);
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 2000);
    };

    const handleAddTemplate = () => {
        if (!newName || !newPrompt) return;
        const newTemp: ProcessTemplate = {
            id: Math.random().toString(36).substring(7),
            name: newName,
            prompt: newPrompt
        };
        onSaveTemplates([...templates, newTemp]);
        setNewName('');
        setNewPrompt('');
    };

    const handleDeleteTemplate = (id: string) => {
        onSaveTemplates(templates.filter(t => t.id !== id));
    };

    const handleEditTemplate = (template: ProcessTemplate) => {
        setEditingTemplate(template);
        setNewName(template.name);
        setNewPrompt(template.prompt);
    };

    const handleUpdateTemplate = () => {
        if (!editingTemplate || !newName || !newPrompt) return;
        onSaveTemplates(templates.map(tmp =>
            tmp.id === editingTemplate.id ? { ...tmp, name: newName, prompt: newPrompt } : tmp
        ));
        setEditingTemplate(null);
        setNewName('');
        setNewPrompt('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.settings}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.appearance}</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">{t.darkMode}</Label>
                            <Switch
                                id="dark-mode"
                                checked={isDark}
                                onCheckedChange={setIsDark}
                            />
                        </div>
                        <div className="space-y-2">
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

                    <div className="border-t my-2" />

                    {/* AI Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.apiKeyTitle}</h4>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                value={localKey}
                                onChange={(e) => setLocalKey(e.target.value)}
                                placeholder={t.apiKeyPlaceholder}
                            />
                            <Button onClick={handleSaveKey} variant={keySaved ? "outline" : "default"}>
                                {keySaved ? 'Saved' : t.saveKey}
                            </Button>
                        </div>
                    </div>

                    <div className="border-t my-2" />

                    {/* Templates Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none text-muted-foreground">{t.templates}</h4>
                        <div className="max-h-[150px] overflow-y-auto space-y-2 border rounded-md p-2">
                            {templates.map(tmp => (
                                <div key={tmp.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-sm">
                                    <span className="text-sm font-medium">{tmp.name}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditTemplate(tmp)}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteTemplate(tmp.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No templates yet</p>}
                        </div>

                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold uppercase opacity-70">
                                    {editingTemplate ? t.editTemplate : t.addTemplate}
                                </h5>
                                {editingTemplate && (
                                    <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(null); setNewName(''); setNewPrompt(''); }}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t.templateName}
                            />
                            <textarea
                                value={newPrompt}
                                onChange={(e) => setNewPrompt(e.target.value)}
                                placeholder={t.templatePrompt}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Button onClick={editingTemplate ? handleUpdateTemplate : handleAddTemplate} className="w-full">
                                {editingTemplate ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {editingTemplate ? t.save : t.addTemplate}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
