import React, { useState } from 'react';
import { Language } from '../i18n';
import { ProcessTemplate } from '../types';
import { ColorPicker } from './ColorPicker';

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

    if (!isOpen) return null;

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
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3 className="modal-title ml-8">{t.settings}</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Appearance Section */}
                    <div className="settings-section">
                        <h4 className="settings-subtitle">{t.appearance}</h4>
                        <div className="settings-row">
                            <span>{t.darkMode}</span>
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className={`toggle-btn ${isDark ? 'active' : ''}`}
                            >
                                <div className="toggle-slider"></div>
                            </button>
                        </div>
                        <div className="settings-row">
                            <span>{t.themeColor}</span>
                            <ColorPicker primaryHue={primaryHue} setPrimaryHue={setPrimaryHue} t={t} />
                        </div>
                        <div className="settings-row">
                            <span>{t.language}</span>
                            <select
                                value={lang}
                                onChange={(e) => setLang(e.target.value as Language)}
                                className="settings-select"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                        <div className="settings-row">
                            <span>Global Scale</span>
                            <div className="font-controls mini">
                                <button className="font-btn mini" onClick={() => onSaveFontScale(Math.max(0.5, fontScale - 0.1))}>−</button>
                                <span className="font-size-display mini">{Math.round(fontScale * 100)}%</span>
                                <button className="font-btn mini" onClick={() => onSaveFontScale(Math.min(2, fontScale + 0.1))}>+</button>
                            </div>
                        </div>
                    </div>

                    {/* AI Section */}
                    <div className="settings-section compact">
                        <h4 className="settings-subtitle">{t.apiKeyTitle}</h4>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={localKey}
                                onChange={(e) => setLocalKey(e.target.value)}
                                placeholder={t.apiKeyPlaceholder}
                                className="settings-input"
                            />
                            <button onClick={handleSaveKey} className="settings-btn-primary">
                                {keySaved ? '✓ Saved' : t.saveKey}
                            </button>
                        </div>
                    </div>

                    {/* Templates Section */}
                    <div className="settings-section">
                        <h4 className="settings-subtitle">{t.templates}</h4>
                        <div className="template-scroll-area">
                            <div className="template-list">
                                {templates.map(tmp => (
                                    <div key={tmp.id} className="template-item">
                                        <div className="template-info">
                                            <span className="template-name">{tmp.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditTemplate(tmp)} className="icon-btn-small">
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteTemplate(tmp.id)} className="icon-btn-small text-red-500">
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="template-form glass-panel p-4">
                            <h5 className="text-xs font-bold mb-3 uppercase opacity-70 ml-4">
                                {editingTemplate ? t.editTemplate : t.addTemplate}
                            </h5>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t.templateName}
                                className="settings-input mb-2"
                            />
                            <textarea
                                value={newPrompt}
                                onChange={(e) => setNewPrompt(e.target.value)}
                                placeholder={t.templatePrompt}
                                className="settings-input mb-2 h-20 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                                {editingTemplate && (
                                    <button onClick={() => { setEditingTemplate(null); setNewName(''); setNewPrompt(''); }} className="settings-btn-secondary">
                                        {t.cancel}
                                    </button>
                                )}
                                <button onClick={editingTemplate ? handleUpdateTemplate : handleAddTemplate} className="settings-btn-primary">
                                    {editingTemplate ? t.save : t.addTemplate}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
