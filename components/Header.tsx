
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
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-900 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-90 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M12 1v22M5 8v8M19 8v8M8 12v0M16 12v0M2 10v4M22 10v4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight">{t.title}</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-800"
            title="Switch Language"
          >
            <span className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">{lang}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-800"
            title="Toggle Theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
             <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">{t.sandbox}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
