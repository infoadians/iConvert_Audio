
import React from 'react';
import { Language } from '../i18n';
import { ColorPicker } from './ColorPicker';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  t: any;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  primaryHue: number;
  setPrimaryHue: (hue: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang, setLang, isDark, setIsDark, t, onOpenSettings, hasApiKey, primaryHue, setPrimaryHue
}) => {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-box">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="logo-title">iConvert Audio</span>
        </div>

        <div className="header-actions">
          <button
            onClick={onOpenSettings}
            className={`api-key-btn ${hasApiKey ? 'active' : 'inactive'}`}
          >
            {hasApiKey ? (
              <>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                AI Ready
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a.5.5 0 01-.496.068l-1.5-1.5a.5.5 0 01-.068-.496l.546-2.552a.5.5 0 01.069-.496l1.5-1.5a.5.5 0 01.496-.069l1.791.896A5.981 5.981 0 0121.414 6.586 1.99 1.99 0 0019 9M9 21h.01M5.25 21h13.5M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5" /></svg>
                Set API Key
              </>
            )}
          </button>

          <div className="divider"></div>

          <ColorPicker primaryHue={primaryHue} setPrimaryHue={setPrimaryHue} t={t} />

          <div className="divider"></div>

          <div className="theme-group">
            <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="icon-btn">
              {lang.toUpperCase()}
            </button>
            <button onClick={() => setIsDark(!isDark)} className="icon-btn">
              {isDark ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
