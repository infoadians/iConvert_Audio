
import React from 'react';
import { Language } from '../i18n';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  t: any;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, isDark, setIsDark, t }) => {
  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-900 sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white">
              <path d="M12 2v20M5 8v8M19 8v8M8 12v0M16 12v0" strokeLinecap="round" />
            </svg>
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm font-black dark:text-white leading-none">{t.title}</h1>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-black uppercase text-slate-500 dark:text-zinc-400 border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 transition-all"
          >
            {lang}
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 transition-all"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
