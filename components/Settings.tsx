
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions, t }) => {
  return (
    <div className="settings-container">
      {/* Bitrate Selector */}
      <div className="settings-row">
        <label className="settings-label">
          {t.bitrate}
        </label>
        <div className="settings-options-grid">
          {BITRATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOptions({ ...options, bitrate: opt.value })}
              className={`option-btn ${options.bitrate === opt.value ? 'active' : ''}`}
            >
              {opt.label.split(' ')[0]} <span>{opt.label.includes('Standard') ? 'STD' : opt.label.includes('High') ? 'HQ' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sample Rate Selector */}
      <div className="settings-row">
        <label className="settings-label">
          {t.frequency}
        </label>
        <div className="settings-options-grid">
          {SAMPLE_RATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOptions({ ...options, sampleRate: opt.value })}
              className={`option-btn ${options.sampleRate === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
