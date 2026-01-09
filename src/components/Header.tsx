
import React from 'react';
import { Language } from '../i18n';
import { Button } from '@/components/ui/button';
import { Settings, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight">Transcribo</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted opacity-70 hover:opacity-100">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <Info className="h-6 w-6 text-primary" />
                      {t.infoModal.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t.infoModal.description}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{t.infoModal.sections.queue.split(':')[0]}</h4>
                        <p className="text-sm text-muted-foreground">{t.infoModal.sections.queue.split(':')[1]}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{t.infoModal.sections.transcribed.split(':')[0]}</h4>
                        <p className="text-sm text-muted-foreground">{t.infoModal.sections.transcribed.split(':')[1]}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{t.infoModal.sections.documents.split(':')[0]}</h4>
                        <p className="text-sm text-muted-foreground">{t.infoModal.sections.documents.split(':')[1]}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{t.infoModal.sections.results.split(':')[0]}</h4>
                        <p className="text-sm text-muted-foreground">{t.infoModal.sections.results.split(':')[1]}</p>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                      <p className="text-sm font-medium text-primary">
                        {t.infoModal.templates}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
