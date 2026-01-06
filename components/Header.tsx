
import React from 'react';
import { Language } from '../i18n';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  t: any;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, isDark, setIsDark, t, onOpenSettings, hasApiKey }) => {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 8v8M17 8v8M2 11v2M22 11v2" />
            </svg>
          </div>
          <span className="logo-title">iConvert</span>
        </div>

        <div className="header-actions">
          <button
            onClick={onOpenSettings}
            className={`api-key-btn ${hasApiKey ? 'active' : 'inactive'}`}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a.5.5 0 01-.496.068l-1.5-1.5a.5.5 0 01-.068-.496l.546-2.552a.5.5 0 01.069-.496l1.5-1.5a.5.5 0 01.496-.069l1.791.896A5.981 5.981 0 0121.414 6.586 1.99 1.99 0 0019 9M9 21h.01M5.25 21h13.5M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5" />
            </svg>
            {hasApiKey ? 'AI Active' : 'Add AI Key'}
          </button>

          <div className="divider"></div>

          <div className="theme-group">
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="icon-btn"
            >
              {lang}
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="icon-btn"
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
      </div>
    </header>
  );
};
