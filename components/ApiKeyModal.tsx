
import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
  t: any;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey, t }) => {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    setKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a.5.5 0 01-.496.068l-1.5-1.5a.5.5 0 01-.068-.496l.546-2.552a.5.5 0 01.069-.496l1.5-1.5a.5.5 0 01.496-.069l1.791.896A5.981 5.981 0 0121.414 6.586 1.99 1.99 0 0019 9M9 21h.01M5.25 21h13.5M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5" />
              </svg>
            </div>
            <h3 className="modal-title">{t.apiKeyTitle}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="modal-desc">
          {t.apiKeyDesc}
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t.apiKeyPlaceholder}
          className="modal-input"
        />

        <div className="modal-actions">
          <button
            onClick={() => { onSave(key); onClose(); }}
            className="action-btn-primary"
          >
            {key ? t.saveKey : t.removeKey}
          </button>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-secondary"
          >
            <span>{t.getKey}</span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
