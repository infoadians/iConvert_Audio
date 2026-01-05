
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-lg shadow-zinc-500/20 dark:shadow-none">
             {/* Waveform Icon */}
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white dark:text-zinc-900">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 8v8M17 8v8M2 11v2M22 11v2" />
             </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
            iConvert
          </span>
        </div>
        
        <div className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all hover:shadow-sm"
          >
            {lang}
          </button>

          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-0.5"></div>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all hover:shadow-sm"
          >
            {isDark ? (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
