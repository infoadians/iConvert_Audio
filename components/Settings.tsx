
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-24">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Output Quality
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            MP3 Bitrate
          </label>
          <div className="grid grid-cols-1 gap-2">
            {BITRATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, bitrate: opt.value })}
                className={`
                  text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all
                  ${options.bitrate === opt.value 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Sample Rate
          </label>
          <div className="flex gap-2">
            {SAMPLE_RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, sampleRate: opt.value })}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                  ${options.sampleRate === opt.value 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-start space-x-2 text-[10px] leading-relaxed text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p>Higher bitrates provide better sound quality but result in larger file sizes. CD Quality is standard for most uses.</p>
        </div>
      </div>
    </div>
  );
};
