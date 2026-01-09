
import React from 'react';
import { Language } from '../i18n';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  t: any;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  t, onOpenSettings, lang
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/bella-logo.png" alt="Logo" className="h-12 w-auto" />
          <div className="flex flex-col -space-y-1">
            <span className="text-3xl font-extrabold tracking-tight">Transcribo</span>
            <span className="text-sm text-muted-foreground font-medium">
              {lang === 'es' ? "Convierte, Transcribe, Procesa" : "Convert, Transcribe & Process"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title={t.settings}
            className="h-16 w-16"
          >
            <Settings className="h-10 w-10" />
          </Button>
        </div>
      </div>
    </header>
  );
};
