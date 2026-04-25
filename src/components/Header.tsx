
import React from 'react';
import { Language } from '../i18n';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  activeApiKey: 'free' | 'paid';
}

export const Header: React.FC<HeaderProps> = ({
  t, onOpenSettings, lang, hasApiKey, activeApiKey
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
                <DialogContent className="w-screen h-screen max-w-none rounded-none border-none flex flex-col p-0 gap-0 bg-background">
                  <div className="p-6 pb-2">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        {t.infoModal.title}
                      </DialogTitle>
                    </DialogHeader>
                  </div>

                  <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="mt-2 space-y-6">
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

                        <div className="rounded-lg border p-4 bg-muted/50 sm:col-span-2">
                          <h4 className="font-semibold mb-2">{t.infoModal.templates.split(':')[0]}</h4>
                          <p className="text-sm text-muted-foreground">{t.infoModal.templates.split(':')[1]}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {lang === 'es' ? "Convierte, Transcribe, Procesa" : "Convert, Transcribe & Process"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasApiKey && (
            <span
              className={
                activeApiKey === 'paid'
                  ? "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              }
              title={activeApiKey === 'paid' ? (t.paidKey || 'Paid API') : (t.freeKey || 'Free API')}
            >
              {activeApiKey === 'paid' ? (t.paidKey || 'Paid') : (t.freeKey || 'Free')}
            </span>
          )}
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
