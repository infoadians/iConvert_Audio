
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
          <span className="text-xl sm:text-2xl font-bold tracking-tight">
            {lang === 'es' ? "Convierte, Transcribe, Procesa" : "Convert, Transcribe & Process"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title={t.settings}
            className="h-12 w-12"
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </header>
  );
};
